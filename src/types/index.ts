export type ApplicationStatus =
  | "applied"
  | "pending"
  | "interview"
  | "rejected"
  | "prepared";

export interface PipelineApplication {
  id: string;
  externalId: string;
  company: string;
  role: string;
  jobLocation: string;
  jobUrl: string;
  source: string;
  matchScore: number;
  resumeVersion: string;
  tailoredResume: string;
  coverLetter: string;
  status: "prepared" | "skipped_low_score" | "error";
  dateFound: string;
  runId: string;
  notes: string;
  resumePdfPath: string;
  coverLetterPdfPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineApplicationInput {
  external_id: string;
  company: string;
  job_title: string;
  job_location?: string;
  job_url?: string;
  source?: string;
  match_score?: number;
  resume_version?: string;
  tailored_resume: string;
  cover_letter: string;
  date_found?: string;
  run_id?: string;
  notes?: string;
}

export type AutomationStatus = "idle" | "running" | "completed" | "error";

export interface JobMatch {
  id: string;
  company: string;
  companyLogo: string;
  title: string;
  matchScore: number;
  location: string;
  remote: boolean;
  jobUrl?: string;
  status?: PipelineApplication["status"];
}

export interface Application {
  id: string;
  company: string;
  role: string;
  matchScore: number;
  resumeVersion: string;
  appliedDate: string;
  status: ApplicationStatus;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "application" | "interview" | "match" | "automation";
  href?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  linkedin: string;
  github: string;
  portfolio: string;
  resumeText: string;
  jobTitles: string[];
  countries: string[];
  remote: boolean;
  minSalary: number;
  yearsExperience: number;
  skills: string[];
  projects: { name: string; description: string; url?: string }[];
  education: { school: string; degree: string; year: string }[];
  experience: {
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
}

export interface JobProfile extends UserProfile {
  targetLocations: string;
  targetTitles?: string;
  matchThreshold: number;
  maxJobAgeDays: number;
  maxJobsPerRun: number;
  includeRemote: boolean;
  includeHybrid: boolean;
  includeOnsite: boolean;
  autoGenerateResume: boolean;
  generateCoverLetter: boolean;
}

export interface AutomationSettings {
  jobTitles: string[];
  countries: string[];
  minMatchScore: number;
  remoteOnly: boolean;
  autoGenerateResume: boolean;
  generateCoverLetter: boolean;
  autoApply: boolean;
}

export interface DashboardStats {
  applications: number;
  interviews: number;
  pending: number;
  rejected: number;
}
