import type { JobListing, EmploymentType } from "@/types/career";
import type { MatchOutput, NormalizedJob } from "@/lib/pipeline/types";

function slugId(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function toEmploymentType(workType?: string, location?: string): EmploymentType {
  const loc = (location || "").toLowerCase();
  if (workType === "remote" || /remote|wfh|anywhere/.test(loc)) return "remote";
  if (workType === "hybrid" || /hybrid/.test(loc)) return "hybrid";
  return "onsite";
}

export function toJobListing(job: NormalizedJob, scored: MatchOutput): JobListing {
  const employmentType = toEmploymentType(job.work_type, job.job_location);
  return {
    id: slugId(job.external_id),
    externalId: job.external_id,
    company: job.company,
    companyLogo: job.company.charAt(0).toUpperCase(),
    title: job.job_title,
    location: job.job_location || "—",
    remote: employmentType === "remote",
    employmentType,
    matchScore: scored.match_score,
    postedDate: job.date_posted || new Date().toISOString(),
    applyUrl: job.job_url,
    source: job.source,
    description: job.description,
    responsibilities: [],
    requirements: [],
    requiredSkills: scored.required_keywords,
    matchedSkills: scored.matched_skills,
    missingSkills: scored.missing_skills,
    scoreReason: scored.summary,
    aiRecommendation: scored.summary,
  };
}

export function toNormalizedJob(job: JobListing): NormalizedJob {
  return {
    external_id: job.externalId || job.id,
    company: job.company,
    job_title: job.title,
    job_location: job.location,
    job_url: job.applyUrl,
    source: job.source,
    description: job.description,
    date_posted: job.postedDate,
    work_type: job.employmentType,
  };
}
