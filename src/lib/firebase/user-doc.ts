import type { UserCareerProfile } from "@/types/career";

export interface UserDocument {
  email: string;
  plan: "free" | "pro";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  careerProfile: UserCareerProfile;
  updatedAt: string;
}

export const USERS_COLLECTION = "users";

export function defaultUserDoc(email: string): UserDocument {
  return {
    email,
    plan: "free",
    careerProfile: {
      analysis: null,
      jobTitles: [],
      location: {
        countries: ["Saudi Arabia"],
        cities: ["Riyadh"],
        employmentTypes: ["remote", "hybrid"],
        searchGlobal: false,
      },
      salaryExpectation: "",
      plan: "free",
      freeResumeUsed: false,
      freeCoverUsed: false,
      onboardingComplete: false,
      applications: {},
      digest: {
        enabled: false,
        time: "08:00",
        timezone: "Asia/Riyadh",
      },
    },
    updatedAt: new Date().toISOString(),
  };
}
