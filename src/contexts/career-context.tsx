"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_JOB_TITLES,
  DEMO_ANALYSIS,
  getSortedJobs,
} from "@/lib/mock/career-data";
import { getDir, translations, type Locale, type TranslationKeys } from "@/lib/i18n";
import type {
  ApplicationRecord,
  JobListing,
  LocationPreferences,
  OptimizedDocuments,
  Plan,
  ResumeAnalysis,
  UserCareerProfile,
} from "@/types/career";
import { DEFAULT_LOCATION } from "@/types/career";

const STORAGE_KEY = "careerai-state";

const defaultProfile: UserCareerProfile = {
  analysis: null,
  jobTitles: DEFAULT_JOB_TITLES,
  location: DEFAULT_LOCATION,
  salaryExpectation: "",
  plan: "free",
  freeResumeUsed: false,
  freeCoverUsed: false,
  onboardingComplete: false,
  applications: {},
};

interface CareerContextValue {
  locale: Locale;
  t: TranslationKeys;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  profile: UserCareerProfile;
  jobs: JobListing[];
  setAnalysis: (analysis: ResumeAnalysis) => void;
  setJobTitles: (titles: string[]) => void;
  setLocation: (location: LocationPreferences) => void;
  setSalaryExpectation: (value: string) => void;
  completeOnboarding: () => void;
  loadDemo: () => void;
  markResumeUsed: () => void;
  markCoverUsed: () => void;
  canGenerateResume: (matchScore: number, threshold?: number) => boolean;
  canGenerateCover: () => boolean;
  saveApplication: (jobId: string, record: ApplicationRecord) => void;
  getApplication: (jobId: string) => ApplicationRecord | undefined;
  generateDocuments: (job: JobListing) => OptimizedDocuments;
  resetOnboarding: () => void;
}

const CareerContext = createContext<CareerContextValue | null>(null);

function loadState(): UserCareerProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function CareerProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [profile, setProfile] = useState<UserCareerProfile>(defaultProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(loadState());
    const savedLocale = localStorage.getItem("careerai-locale") as Locale | null;
    if (savedLocale === "ar" || savedLocale === "en") setLocaleState(savedLocale);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile, hydrated]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("careerai-locale", next);
    document.documentElement.lang = next;
    document.documentElement.dir = getDir(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDir(locale);
  }, [locale]);

  const t = translations[locale];
  const dir = getDir(locale);
  const jobs = useMemo(() => getSortedJobs(), []);

  const updateProfile = useCallback((patch: Partial<UserCareerProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const setAnalysis = useCallback(
    (analysis: ResumeAnalysis) => updateProfile({ analysis }),
    [updateProfile]
  );

  const loadDemo = useCallback(() => {
    updateProfile({
      analysis: DEMO_ANALYSIS,
      jobTitles: DEFAULT_JOB_TITLES,
    });
  }, [updateProfile]);

  const completeOnboarding = useCallback(() => {
    updateProfile({ onboardingComplete: true });
  }, [updateProfile]);

  const canGenerateResume = useCallback(
    (matchScore: number, threshold = 70) => {
      if (matchScore < threshold) return false;
      if (profile.plan === "pro") return true;
      return !profile.freeResumeUsed;
    },
    [profile.plan, profile.freeResumeUsed]
  );

  const canGenerateCover = useCallback(() => {
    if (profile.plan === "pro") return true;
    return !profile.freeCoverUsed;
  }, [profile.plan, profile.freeCoverUsed]);

  const generateDocuments = useCallback(
    (job: JobListing): OptimizedDocuments => {
      const base = profile.analysis?.rawText || DEMO_ANALYSIS.rawText;
      const optimized = `${profile.analysis?.name || "Candidate"}\n\nPROFESSIONAL SUMMARY\nSoftware engineer with experience in ${job.matchedSkills.slice(0, 4).join(", ")}.\n\nRELEVANT EXPERIENCE\n• Highlighted projects aligned with ${job.title} at ${job.company}\n• Emphasized ${job.matchedSkills[0] || "mobile"} and API integration work\n\nSKILLS\n${job.matchedSkills.join(" · ")}`;
      const cover = `Dear ${job.company} Hiring Team,\n\nI am excited to apply for the ${job.title} role. My background in ${profile.analysis?.programmingLanguages.slice(0, 3).join(", ") || "software development"} aligns with your requirements.\n\nI have shipped production applications including ${profile.analysis?.projects[0] || "published mobile apps"}, with hands-on experience in ${job.matchedSkills.slice(0, 3).join(", ")}.\n\nThank you for your consideration.\n\n${profile.analysis?.name || ""}`;
      return {
        originalResume: base,
        optimizedResume: optimized,
        diffHighlights: [
          "Reordered experience to lead with mobile projects",
          "Added ATS keywords from job description",
          "Highlighted matched skills: " + job.matchedSkills.slice(0, 3).join(", "),
        ],
        coverLetter: cover,
        approved: false,
      };
    },
    [profile.analysis]
  );

  const value: CareerContextValue = {
    locale,
    t,
    dir,
    setLocale,
    profile,
    jobs,
    setAnalysis,
    setJobTitles: (jobTitles) => updateProfile({ jobTitles }),
    setLocation: (location) => updateProfile({ location }),
    setSalaryExpectation: (salaryExpectation) => updateProfile({ salaryExpectation }),
    completeOnboarding,
    loadDemo,
    markResumeUsed: () => updateProfile({ freeResumeUsed: true }),
    markCoverUsed: () => updateProfile({ freeCoverUsed: true }),
    canGenerateResume,
    canGenerateCover,
    saveApplication: (jobId, record) =>
      setProfile((prev) => ({
        ...prev,
        applications: { ...prev.applications, [jobId]: record },
      })),
    getApplication: (jobId) => profile.applications[jobId],
    generateDocuments,
    resetOnboarding: () => {
      localStorage.removeItem(STORAGE_KEY);
      setProfile(defaultProfile);
    },
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareer() {
  const ctx = useContext(CareerContext);
  if (!ctx) throw new Error("useCareer must be used within CareerProvider");
  return ctx;
}
