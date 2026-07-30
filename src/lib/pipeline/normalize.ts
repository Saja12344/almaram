import type { BoardSource, NormalizedJob } from "./types";

export function stripHtml(html: unknown): string {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizePublicJobs(
  source: BoardSource,
  body: unknown
): NormalizedJob[] {
  const out: NormalizedJob[] = [];
  const board = source.board;
  const company = source.company || "";
  let list: unknown[] = [];

  const data = body as Record<string, unknown>;
  if (board === "greenhouse") list = Array.isArray(data.jobs) ? data.jobs : [];
  else if (board === "lever") list = Array.isArray(body) ? (body as unknown[]) : [];
  else if (board === "ashby") list = Array.isArray(data.jobs) ? data.jobs : [];

  for (const raw of list) {
    const j = raw as Record<string, unknown>;
    let title = "";
    let loc = "";
    let url = "";
    let desc = "";
    let ext = "";
    let datePosted: string | null = null;

    if (board === "greenhouse") {
      const location = j.location as Record<string, string> | undefined;
      title = String(j.title || "");
      loc = location?.name || "";
      url = String(j.absolute_url || "");
      desc = stripHtml(j.content);
      ext = `greenhouse-${company}-${j.id}`;
      datePosted = String(j.updated_at || j.first_published || "") || null;
    } else if (board === "lever") {
      const categories = j.categories as Record<string, string> | undefined;
      title = String(j.text || "");
      loc = categories?.location || "";
      url = String(j.hostedUrl || "");
      desc = stripHtml(j.descriptionPlain || j.description);
      ext = `lever-${company}-${j.id}`;
      datePosted = String(j.createdAt || "") || null;
    } else if (board === "ashby") {
      title = String(j.title || "");
      loc = String(j.location || "");
      url = String(j.jobUrl || j.applyUrl || "");
      desc = stripHtml(j.descriptionPlain || j.description);
      ext = `ashby-${company}-${j.id || j.jobId}`;
      datePosted = String(j.publishedAt || "") || null;
    }

    if (!title || !ext) continue;
    out.push({
      external_id: ext,
      company,
      job_title: title,
      job_location: loc,
      job_url: url,
      source: board,
      description: desc.slice(0, 6000),
      date_posted: datePosted,
    });
  }
  return out;
}

export function normalizeAdzunaJobs(body: unknown): NormalizedJob[] {
  const out: NormalizedJob[] = [];
  const data = body as Record<string, unknown>;
  const list = Array.isArray(data.results) ? data.results : [];

  for (const raw of list) {
    const j = raw as Record<string, unknown>;
    const companyObj = j.company as Record<string, string> | undefined;
    const locObj = j.location as Record<string, string> | undefined;
    out.push({
      external_id: `adzuna-${j.id}`,
      company: companyObj?.display_name || "",
      job_title: String(j.title || ""),
      job_location: locObj?.display_name || "",
      job_url: String(j.redirect_url || ""),
      source: "adzuna",
      description: String(j.description || "").slice(0, 6000),
      date_posted: String(j.created || "") || null,
    });
  }
  return out;
}
