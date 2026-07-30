# JobPilot AI

A premium SaaS frontend for AI-powered job application automation. Built with Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in with email or Google |
| `/onboarding` | 5-step profile setup wizard |
| `/dashboard` | Overview, stats, and job matches |
| `/automation` | Configure and run job automation |
| `/applications` | Application history with filters |
| `/profile` | Manage personal info and preferences |

## n8n Integration

Production-ready workflows live in [`n8n/`](n8n/README.md):

- **Daily agent** — fetches jobs (Adzuna, Greenhouse, Lever, Ashby, RSS), scores against your resume, generates PDFs for matches ≥ 70%, emails a daily report at 8:00 AM Saudi time
- **Sub-workflows** — modular fetch, process, and auto-apply stub
- **Webhook** — `POST /webhook/automation/start` for manual runs from the UI

See [`n8n/README.md`](n8n/README.md) for import steps, env vars, and Google Sheets setup.

Frontend placeholders in `src/lib/webhooks.ts` can call your n8n webhook URLs once deployed.

## Tech Stack

- Next.js 15+ (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui

## Mock Data

All data lives in `src/lib/mock-data.ts`. No backend or API connections.
