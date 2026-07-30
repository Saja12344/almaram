#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

pkill -f "next-server" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
pkill -f "ngrok http" 2>/dev/null || true
rm -f "$ROOT/.setup-pids"
echo "Stopped site + ngrok"
