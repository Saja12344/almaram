import { fetchAllJobs } from "@/lib/pipeline/fetch-jobs";
import { filterAndDedupeJobs } from "@/lib/pipeline/filter";
import { codeMatchScore } from "@/lib/pipeline/match-score";
import type { JobProfile } from "@/types";
import type { JobListing } from "@/types/career";
import { toJobListing } from "./job-mapper";

export async function searchJobsForProfile(
  jobProfile: JobProfile,
  limit: number,
  existingIds: Set<string> = new Set()
): Promise<JobListing[]> {
  if (!jobProfile.resumeText?.trim()) {
    throw new Error("Resume text is required before searching for jobs");
  }

  const allJobs = await fetchAllJobs();
  const filtered = filterAndDedupeJobs(allJobs, jobProfile, existingIds);
  const scored: JobListing[] = [];

  for (const job of filtered) {
    if (scored.length >= limit) break;
    const result = codeMatchScore(jobProfile, job);
    if (result.output.match_score < (jobProfile.matchThreshold || 55)) continue;
    scored.push(toJobListing(job, result.output));
  }

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}
