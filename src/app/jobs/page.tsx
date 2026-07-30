"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CareerShell, PageIntro } from "@/components/career/shell";
import { JobCard } from "@/components/career/job-card";
import { useCareer } from "@/contexts/career-context";

export default function JobsPage() {
  const router = useRouter();
  const { t, profile, jobs } = useCareer();

  useEffect(() => {
    if (!profile.onboardingComplete) router.replace("/");
  }, [profile.onboardingComplete, router]);

  if (!profile.onboardingComplete) return null;

  return (
    <CareerShell>
      <PageIntro title={t.jobs.title} subtitle={t.jobs.subtitle} />
      <p className="mb-6 text-sm text-muted-foreground">
        {jobs.length} {t.jobs.matches}
      </p>
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <JobCard key={job.id} job={job} index={index} />
        ))}
      </div>
    </CareerShell>
  );
}
