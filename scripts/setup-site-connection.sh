#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${JOBPILOT_PORT:-3000}"
SECRET_FILE="$ROOT/.env.local"
NGROK_API="http://127.0.0.1:4040/api/tunnels"

echo "== JobPilot ↔ n8n setup =="

# 1) Ensure .env.local with shared secret
if [[ ! -f "$SECRET_FILE" ]] || grep -q "change-me" "$SECRET_FILE" 2>/dev/null; then
  SECRET="$(openssl rand -hex 24)"
  cat > "$SECRET_FILE" <<EOF
NEXT_PUBLIC_APP_URL=http://localhost:${PORT}
JOBPILOT_INGEST_SECRET=${SECRET}
EOF
  echo "✓ Created .env.local with new ingest secret"
else
  SECRET="$(grep '^JOBPILOT_INGEST_SECRET=' "$SECRET_FILE" | cut -d= -f2-)"
  echo "✓ Using existing .env.local"
fi

# 2) Stop stale Next/ngrok processes
pkill -f "next-server" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "ngrok http" 2>/dev/null || true
sleep 1

# 3) Build + start production server (stable)
echo "→ Building site..."
npm run build --silent
echo "→ Starting site on port ${PORT}..."
npm start -- --port "$PORT" > "$ROOT/.site.log" 2>&1 &
SITE_PID=$!
sleep 2

if ! curl -sf "http://127.0.0.1:${PORT}/api/applications" >/dev/null; then
  echo "✗ Site failed to start. See .site.log"
  exit 1
fi
echo "✓ Site running: http://localhost:${PORT}/applications"

# 4) Start ngrok (n8n Cloud needs public URL)
if ! command -v ngrok >/dev/null; then
  echo "✗ ngrok not installed. brew install ngrok"
  exit 1
fi

ngrok http "$PORT" --log=stdout > "$ROOT/.ngrok.log" 2>&1 &
NGROK_PID=$!
echo "→ Waiting for ngrok tunnel..."
PUBLIC_URL=""
for _ in $(seq 1 30); do
  PUBLIC_URL="$(curl -sf "$NGROK_API" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(next((t['public_url'] for t in d.get('tunnels',[]) if t.get('proto')=='https'), ''))" 2>/dev/null || true)"
  [[ -n "$PUBLIC_URL" ]] && break
  sleep 1
done

if [[ -z "$PUBLIC_URL" ]]; then
  echo "✗ ngrok tunnel failed. See .ngrok.log"
  exit 1
fi
echo "✓ Public URL: $PUBLIC_URL"

# 5) Test n8n webhook (site reads from n8n, not local files)
WEBHOOK_URL="$(grep '^N8N_APPLICATIONS_WEBHOOK_URL=' "$SECRET_FILE" | cut -d= -f2- || true)"
if [[ -n "$WEBHOOK_URL" ]]; then
  WH_CODE="$(curl -s -o "$ROOT/.webhook-test.json" -w "%{http_code}" \
    -H "X-JobPilot-Secret: $SECRET" \
    "$WEBHOOK_URL")"
  if [[ "$WH_CODE" == "200" ]]; then
    COUNT="$(python3 -c "import json; d=json.load(open('$ROOT/.webhook-test.json')); print(d.get('count', len(d.get('applications',[]))))" 2>/dev/null || echo "?")"
    echo "✓ n8n webhook OK — $COUNT jobs in job_applications"
  else
    echo "⚠ n8n webhook not ready (HTTP $WH_CODE). Import webhook-list-applications.json and Activate."
    cat "$ROOT/.webhook-test.json" 2>/dev/null || true
  fi
else
  echo "⚠ Set N8N_APPLICATIONS_WEBHOOK_URL in .env.local after activating n8n webhook"
fi

# Legacy ingest test (optional)
TEST_PAYLOAD='{"external_id":"setup-test-001","company":"JobPilot","job_title":"Setup Test Engineer","job_location":"Remote, Saudi Arabia","job_url":"https://example.com/jobs/1","source":"setup","match_score":88,"tailored_resume":"Test resume body from setup script.","cover_letter":"Test cover letter from setup script.","notes":"setup test"}'

HTTP_CODE="$(curl -s -o "$ROOT/.ingest-test.json" -w "%{http_code}" \
  -X POST "$PUBLIC_URL/api/applications/ingest" \
  -H "Content-Type: application/json" \
  -H "X-JobPilot-Secret: $SECRET" \
  -d "$TEST_PAYLOAD")"

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "✗ Ingest test failed (HTTP $HTTP_CODE). Response:"
  cat "$ROOT/.ingest-test.json"
  exit 1
fi
echo "✓ Ingest test OK — sample job pushed to site"

# 6) Write n8n config snippet for copy-paste
CONFIG="$ROOT/n8n/JOB-PROFILE-SITE-CONFIG.txt"
cat > "$CONFIG" <<EOF
# Copy these fields into n8n → Data → job_profile (one row)

site_url=${PUBLIC_URL}
ingest_secret=${SECRET}

# Also update workflow if not imported yet:
# Actions → Import from file → Desktop/job-application-pipeline-apply-ready.json

# Verify in browser:
# ${PUBLIC_URL}/applications
EOF

cat > "$ROOT/.setup-pids" <<EOF
SITE_PID=$SITE_PID
NGROK_PID=$NGROK_PID
PUBLIC_URL=$PUBLIC_URL
EOF

echo ""
echo "=========================================="
echo "SETUP COMPLETE"
echo "=========================================="
echo "Local:   http://localhost:${PORT}/applications"
echo "Public:  ${PUBLIC_URL}/applications"
echo ""
echo "Add to n8n job_profile (saved in n8n/JOB-PROFILE-SITE-CONFIG.txt):"
echo "  site_url = ${PUBLIC_URL}"
echo "  ingest_secret = ${SECRET}"
echo ""
echo "Then import workflow from Desktop and Save (Cmd+S)."
echo "PIDs saved in .setup-pids — run scripts/stop-site-connection.sh to stop."
echo "=========================================="
