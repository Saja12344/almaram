import type { BoardSource } from "./types";

// Verified working Saudi boards (neom/hungerstation/noon return 404 on public API)
const SAUDI_GREENHOUSE = ["careem", "tamara"];

const GLOBAL_GREENHOUSE = [
  "stripe", "gitlab", "cloudflare", "anthropic", "linear", "figma", "vercel",
];

const GLOBAL_LEVER = ["canva"];
const GLOBAL_ASHBY = ["openai", "ramp", "deel"];

const ADZUNA_QUERIES = [
  "software engineer",
  "ios developer",
  "mobile developer",
  "AI engineer",
  "backend engineer",
  "full stack engineer",
  "python developer",
  "LLM engineer",
];

function pushGreenhouse(out: BoardSource[], companies: string[]) {
  for (const company of companies) {
    out.push({
      board: "greenhouse",
      company,
      url: `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`,
    });
  }
}

function pushLever(out: BoardSource[], companies: string[]) {
  for (const company of companies) {
    out.push({
      board: "lever",
      company,
      url: `https://api.lever.co/v0/postings/${company}?mode=json`,
    });
  }
}

function pushAshby(out: BoardSource[], companies: string[]) {
  for (const company of companies) {
    out.push({
      board: "ashby",
      company,
      url: `https://api.ashbyhq.com/posting-api/job-board/${company}`,
    });
  }
}

export function buildPublicBoardSources(): BoardSource[] {
  const out: BoardSource[] = [];
  pushGreenhouse(out, SAUDI_GREENHOUSE);
  pushGreenhouse(out, GLOBAL_GREENHOUSE);
  pushLever(out, GLOBAL_LEVER);
  pushAshby(out, GLOBAL_ASHBY);
  return out;
}

export function buildAdzunaSources(appId: string, appKey: string): BoardSource[] {
  if (!appId || !appKey) return [];
  return ADZUNA_QUERIES.map((what) => ({
    board: "adzuna" as const,
    query: what,
    url:
      `https://api.adzuna.com/v1/api/jobs/sa/search/1` +
      `?app_id=${encodeURIComponent(appId)}` +
      `&app_key=${encodeURIComponent(appKey)}` +
      `&results_per_page=50&what=${encodeURIComponent(what)}` +
      `&where=Riyadh`,
  }));
}

export function buildAllSources(): BoardSource[] {
  return [
    ...buildAdzunaSources(
      process.env.ADZUNA_APP_ID || "",
      process.env.ADZUNA_APP_KEY || ""
    ),
    ...buildPublicBoardSources(),
  ];
}
