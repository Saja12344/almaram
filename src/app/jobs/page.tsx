"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { CareerShell, PageIntro, PrimaryButton } from "@/components/career/shell";
import { JobCard } from "@/components/career/job-card";
import { useCareer } from "@/contexts/career-context";

const MOCK_JOB_IDS = new Set([
  "tamara-flutter-riyadh",
  "neom-ios",
  "careem-remote",
  "stc-ai",
  "linear-remote",
]);

export default function JobsPage() {
  const router = useRouter();
  const { t, profile, jobs, searchJobs } = useCareer();
  const refreshed = useRef(false);

  useEffect(() => {
    if (!profile.onboardingComplete) router.replace("/");
  }, [profile.onboardingComplete, router]);

  useEffect(() => {
    const hasMock =
      jobs.some((j) => MOCK_JOB_IDS.has(j.id)) ||
      (jobs.length > 0 && jobs.every((j) => !j.externalId));
    if (!profile.onboardingComplete || refreshed.current || !hasMock) return;
    refreshed.current = true;
    void searchJobs()
      .then((count) => {
        if (count > 0) toast.message(t.jobs.refreshedLive);
      })
      .catch(() => toast.error(t.jobs.refreshFailed));
  }, [profile.onboardingComplete, jobs, searchJobs, t.jobs.refreshedLive, t.jobs.refreshFailed]);

  if (!profile.onboardingComplete) return null;

  const isLive = Boolean(profile.lastJobFetchAt && jobs.some((j) => j.externalId));

  return (
    <CareerShell>
      <PageIntro title={t.jobs.title} subtitle={t.jobs.subtitle} />
      <p className="mb-6 text-sm text-muted-foreground">
        {jobs.length} {t.jobs.matches}
        {isLive ? <span className="ms-2 opacity-70">· {t.jobs.liveData}</span> : null}
      </p>
      {jobs.length === 0 ? (
        <div className="rounded-[24px] border border-border bg-muted/30 p-8 text-center">
          <p className="text-muted-foreground">{t.jobs.empty}</p>
          <PrimaryButton className="mt-6" onClick={() => void searchJobs()}>
            {t.jobs.refresh}
          </PrimaryButton>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <JobCard key={job.id} job={job} index={index} />
          ))}
        </div>
      )}
    </CareerShell>
  );
}
