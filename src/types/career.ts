export type EmploymentType = "remote" | "hybrid" | "onsite";
export type Plan = "free" | "pro";
export type ApplicationStatus = "ready" | "applied" | "saved";

export interface ResumeAnalysis {
  name: string;
  yearsExperience: number;
  education: string[];
  skills: string[];
  projects: string[];
  certificates: string[];
  programmingLanguages: string[];
  frameworks: string[];
  softSkills: string[];
  rawText: string;
}

export interface LocationPreferences {
  countries: string[];
  cities: string[];
  employmentTypes: EmploymentType[];
  searchGlobal: boolean;
}

export interface JobListing {
  id: string;
  company: string;
  companyLogo: string;
  title: string;
  /** Natural Arabic display title — generated at ingest, not literal UI translation. */
  titleLocalized?: string;
  location: string;
  remote: boolean;
  employmentType: EmploymentType;
  matchScore: number;
  salary?: string;
  postedDate: string;
  applyUrl: string;
  source: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  scoreReason: string;
  aiRecommendation: string;
}

export interface OptimizedDocuments {
  originalResume: string;
  optimizedResume: string;
  diffHighlights: string[];
  coverLetter: string;
  approved: boolean;
}

export interface ApplicationRecord {
  jobId: string;
  status: ApplicationStatus;
  resumeVersion: string;
  coverLetterUsed: boolean;
  documents?: OptimizedDocuments;
}

export interface UserCareerProfile {
  analysis: ResumeAnalysis | null;
  jobTitles: string[];
  location: LocationPreferences;
  salaryExpectation: string;
  plan: Plan;
  freeResumeUsed: boolean;
  freeCoverUsed: boolean;
  onboardingComplete: boolean;
  applications: Record<string, ApplicationRecord>;
}

export const DEFAULT_LOCATION: LocationPreferences = {
  countries: ["Saudi Arabia"],
  cities: ["Riyadh"],
  employmentTypes: ["remote", "hybrid"],
  searchGlobal: false,
};
