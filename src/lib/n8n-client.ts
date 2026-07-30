import type { PipelineApplication } from "@/types";

type N8nJobRow = Record<string, unknown>;

function mapN8nRow(row: N8nJobRow): PipelineApplication | null {
  const externalId = String(row.external_id || "").trim();
  if (!externalId) return null;

  const status = String(row.status || "prepared");
  const allowed = ["prepared", "skipped_low_score", "error"];
  const pipelineStatus = allowed.includes(status)
    ? (status as PipelineApplication["status"])
    : "prepared";

  return {
    id: externalId,
    externalId,
    company: String(row.company || ""),
    role: String(row.job_title || ""),
    jobLocation: String(row.job_location || ""),
    jobUrl: String(row.job_url || ""),
    source: String(row.source || ""),
    matchScore: Number(row.match_score) || 0,
    resumeVersion: String(row.resume_version || ""),
    tailoredResume: String(row.tailored_resume || ""),
    coverLetter: String(row.cover_letter || ""),
    status: pipelineStatus,
    dateFound: String(row.date_found || ""),
    runId: String(row.run_id || ""),
    notes: String(row.notes || ""),
    resumePdfPath: "",
    coverLetterPdfPath: "",
    createdAt: String(row.date_found || ""),
    updatedAt: String(row.date_found || ""),
  };
}

function sortApplications(rows: PipelineApplication[]) {
  return rows.sort(
    (a, b) =>
      new Date(b.dateFound || 0).getTime() -
      new Date(a.dateFound || 0).getTime()
  );
}

async function fetchViaN8nApi(): Promise<PipelineApplication[]> {
  const baseUrl = (process.env.N8N_API_URL || "https://sga37.app.n8n.cloud").replace(
    /\/$/,
    ""
  );
  const apiKey = process.env.N8N_API_KEY;
  const tableId =
    process.env.N8N_APPLICATIONS_TABLE_ID || "48TA6rnQ175ZqaIm";

  if (!apiKey) {
    throw new Error("N8N_API_KEY is missing");
  }

  const rows: N8nJobRow[] = [];
  let cursor: string | undefined;

  do {
    const url = new URL(`${baseUrl}/api/v1/data-tables/${tableId}/rows`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("sortBy", "date_found:desc");
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-N8N-API-KEY": apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `n8n API ${response.status}${body ? `: ${body.slice(0, 160)}` : ""}`
      );
    }

    const payload = await response.json();
    const pageRows = Array.isArray(payload?.data) ? payload.data : [];
    rows.push(...pageRows);
    cursor = payload?.nextCursor || undefined;
  } while (cursor);

  return sortApplications(
    rows
      .map(mapN8nRow)
      .filter((row): row is PipelineApplication => row !== null)
  );
}

async function fetchViaWebhook(): Promise<PipelineApplication[]> {
  const url = process.env.N8N_APPLICATIONS_WEBHOOK_URL;
  if (!url) {
    throw new Error("N8N_APPLICATIONS_WEBHOOK_URL is missing");
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (process.env.JOBPILOT_INGEST_SECRET) {
    headers["X-JobPilot-Secret"] = process.env.JOBPILOT_INGEST_SECRET;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `n8n webhook ${response.status}${body ? `: ${body.slice(0, 160)}` : ""}`
    );
  }

  const payload = await response.json();
  const rows: N8nJobRow[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.applications)
      ? payload.applications
      : [];

  return sortApplications(
    rows
      .map(mapN8nRow)
      .filter((row): row is PipelineApplication => row !== null)
  );
}

export async function fetchApplicationsFromN8n(): Promise<PipelineApplication[]> {
  if (process.env.N8N_API_KEY) {
    return fetchViaN8nApi();
  }

  if (process.env.N8N_APPLICATIONS_WEBHOOK_URL) {
    return fetchViaWebhook();
  }

  throw new Error(
    "Add N8N_API_KEY to .env.local (recommended) — see n8n/API-SETUP.md"
  );
}

export async function getApplicationFromN8n(
  id: string
): Promise<PipelineApplication | undefined> {
  const applications = await fetchApplicationsFromN8n();
  return applications.find(
    (app) => app.id === id || app.externalId === id
  );
}
