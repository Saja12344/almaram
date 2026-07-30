export interface NormalizedJob {
  external_id: string;
  company: string;
  job_title: string;
  job_location: string;
  job_url: string;
  source: string;
  description: string;
  date_posted: string | null;
  work_type?: string;
}

export interface MatchOutput {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  required_keywords: string[];
  summary: string;
  scorer: "code";
}

export interface ScoredJob extends NormalizedJob {
  output: MatchOutput;
}

export interface PipelineRunResult {
  runId: string;
  startedAt: string;
  finishedAt: string;
  processed: number;
  prepared: number;
  skipped: number;
  errors: number;
  emailSent: boolean;
  message: string;
}

export interface BoardSource {
  board: "greenhouse" | "lever" | "ashby" | "adzuna";
  company?: string;
  query?: string;
  url: string;
}
