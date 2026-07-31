import type { JobProfile } from "@/types";
import type { Plan, UserCareerProfile } from "@/types/career";

export function toJobProfile(
  profile: UserCareerProfile,
  email: string,
  plan: Plan = profile.plan
): JobProfile {
  const analysis = profile.analysis;
  const employment = profile.location.employmentTypes;

  return {
    name: analysis?.name || "Candidate",
    email,
    linkedin: "",
    github: "",
    portfolio: "",
    resumeText: analysis?.rawText || "",
    jobTitles: profile.jobTitles,
    countries: profile.location.countries,
    remote: employment.includes("remote"),
    minSalary: 0,
    yearsExperience: analysis?.yearsExperience || 0,
    skills: analysis?.skills || [],
    projects: (analysis?.projects || []).map((name) => ({ name, description: name })),
    education: (analysis?.education || []).map((line) => ({
      school: line,
      degree: line,
      year: "",
    })),
    experience: [],
    targetLocations: profile.location.cities.join(", "),
    targetTitles: profile.jobTitles.join(", "),
    matchThreshold: 55,
    maxJobAgeDays: 14,
    maxJobsPerRun: plan === "pro" ? 40 : 5,
    includeRemote: employment.includes("remote"),
    includeHybrid: employment.includes("hybrid"),
    includeOnsite: employment.includes("onsite"),
    autoGenerateResume: false,
    generateCoverLetter: false,
  };
}
