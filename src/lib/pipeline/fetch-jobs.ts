import { buildAllSources } from "./sources";
import { normalizeAdzunaJobs, normalizePublicJobs } from "./normalize";
import type { NormalizedJob } from "./types";

export async function fetchAllJobs(): Promise<NormalizedJob[]> {
  const sources = buildAllSources();
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const response = await fetch(source.url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });
      if (!response.ok) {
        throw new Error(`${source.board} ${response.status}`);
      }
      const body = await response.json();
      if (source.board === "adzuna") return normalizeAdzunaJobs(body);
      return normalizePublicJobs(source, body);
    })
  );

  const merged: NormalizedJob[] = [];
  const seen = new Set<string>();

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const job of result.value) {
      if (seen.has(job.external_id)) continue;
      seen.add(job.external_id);
      merged.push(job);
    }
  }

  return merged;
}
