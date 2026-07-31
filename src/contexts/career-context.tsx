"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { doc, setDoc } from "firebase/firestore";
import { DEFAULT_JOB_TITLES, DEMO_ANALYSIS } from "@/lib/mock/career-data";
import { getDir, translations, type Locale, type TranslationKeys } from "@/lib/i18n";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";
import { USERS_COLLECTION } from "@/lib/firebase/user-doc";
import { useAuth } from "@/contexts/auth-context";
import type {
  ApplicationRecord,
  JobListing,
  LocationPreferences,
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
  digest: {
    enabled: false,
    time: "08:00",
    timezone: "Asia/Riyadh",
  },
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
  setDigest: (digest: UserCareerProfile["digest"]) => void;
  completeOnboarding: () => void;
  loadDemo: () => void;
  markResumeUsed: () => void;
  markCoverUsed: () => void;
  canGenerateResume: (matchScore: number, threshold?: number) => boolean;
  canGenerateCover: () => boolean;
  saveApplication: (jobId: string, record: ApplicationRecord) => void;
  getApplication: (jobId: string) => ApplicationRecord | undefined;
  getJobById: (id: string) => JobListing | undefined;
  searchJobs: () => Promise<number>;
  resetOnboarding: () => void;
  saveProfile: (override?: Partial<UserCareerProfile>) => Promise<void>;
  saving: boolean;
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
  const { user, userDoc } = useAuth();
  const [locale, setLocaleState] = useState<Locale>("en");
  const [profile, setProfile] = useState<UserCareerProfile>(defaultProfile);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const cloudSynced = useRef(false);

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

  useEffect(() => {
    if (userDoc?.plan && userDoc.plan !== profile.plan) {
      setProfile((prev) => ({ ...prev, plan: userDoc.plan }));
    }
  }, [userDoc?.plan, profile.plan]);

  useEffect(() => {
    if (!user || !userDoc?.careerProfile) return;
    if (cloudSynced.current) return;
    cloudSynced.current = true;
    setProfile((prev) => ({
      ...defaultProfile,
      ...userDoc.careerProfile,
      plan: userDoc.plan ?? prev.plan,
    }));
  }, [user, userDoc]);

  useEffect(() => {
    if (!user) cloudSynced.current = false;
  }, [user]);

  const saveProfile = useCallback(async (override?: Partial<UserCareerProfile>) => {
    setSaving(true);
    const next = { ...profile, ...override };
    try {
      if (override) {
        setProfile(next);
      }
      if (user && isFirebaseConfigured()) {
        await setDoc(
          doc(getFirebaseDb(), USERS_COLLECTION, user.uid),
          {
            careerProfile: next,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } finally {
      setSaving(false);
    }
  }, [user, profile]);

  const t = translations[locale];
  const dir = getDir(locale);

  const jobs = useMemo(
    () => [...(profile.cachedJobs || [])].sort((a, b) => b.matchScore - a.matchScore),
    [profile.cachedJobs]
  );

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

  const searchJobs = useCallback(async (): Promise<number> => {
    const plan: Plan = userDoc?.plan || profile.plan;
    const res = await fetch("/api/jobs/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user?.uid,
        email: user?.email,
        profile,
        plan,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Search failed");

    const patch = {
      cachedJobs: data.jobs as JobListing[],
      lastJobFetchAt: data.fetchedAt as string,
    };
    updateProfile(patch);
    await saveProfile(patch);
    return (data.jobs as JobListing[]).length;
  }, [user, userDoc?.plan, profile, updateProfile, saveProfile]);

  const getJobById = useCallback(
    (id: string) => jobs.find((j) => j.id === id),
    [jobs]
  );

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
    setDigest: (digest) => updateProfile({ digest }),
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
    getJobById,
    searchJobs,
    resetOnboarding: () => {
      localStorage.removeItem(STORAGE_KEY);
      setProfile(defaultProfile);
      cloudSynced.current = false;
    },
    saveProfile,
    saving,
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
