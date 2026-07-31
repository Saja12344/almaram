"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Compass, ExternalLink } from "lucide-react";
import {
  CareerShell,
  PremiumCard,
  PrimaryButton,
} from "@/components/career/shell";
import { MatchBadge } from "@/components/career/job-card";
import { FadeIn } from "@/components/career/motion";
import { useCareer } from "@/contexts/career-context";
import {
  getJobOriginalTitle,
  getJobTitle,
  showOriginalTitleSubtitle,
} from "@/lib/job-display";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale, getJobById } = useCareer();
  const job = getJobById(params.id);

  if (!job) {
    router.replace("/jobs");
    return null;
  }

  return (
    <CareerShell>
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-[18px]" strokeWidth={2} />
        {t.jobDetail.back}
      </Link>

      <FadeIn>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {getJobTitle(job, locale)}
            </h1>
            {showOriginalTitleSubtitle(job, locale) ? (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="opacity-70">{t.jobs.asPosted}: </span>
                {getJobOriginalTitle(job)}
              </p>
            ) : null}
            <p className="mt-2 text-lg text-muted-foreground">
              {job.company} · {job.location}
            </p>
          </div>
          <MatchBadge score={job.matchScore} />
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PremiumCard>
            <h2 className="text-lg font-semibold">{t.jobDetail.description}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{job.description}</p>
          </PremiumCard>
          <PremiumCard>
            <h2 className="text-lg font-semibold">{t.jobDetail.responsibilities}</h2>
            <ul className="mt-3 list-disc space-y-2 ps-5 text-muted-foreground">
              {job.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </PremiumCard>
          <PremiumCard>
            <h2 className="text-lg font-semibold">{t.jobDetail.requirements}</h2>
            <ul className="mt-3 list-disc space-y-2 ps-5 text-muted-foreground">
              {job.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </PremiumCard>
        </div>

        <div className="space-y-6">
          <PremiumCard>
            <h2 className="text-lg font-semibold">{t.jobDetail.matchedSkills}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.matchedSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary dark:bg-accent/10 dark:text-accent"
                >
                  {s}
                </span>
              ))}
            </div>
          </PremiumCard>
          <PremiumCard>
            <h2 className="text-lg font-semibold">{t.jobDetail.missingSkills}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.missingSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </PremiumCard>
          <PremiumCard>
            <h2 className="text-lg font-semibold">{t.jobDetail.scoreReason}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{job.scoreReason}</p>
          </PremiumCard>
          <PremiumCard className="border-primary/20 bg-primary text-primary-foreground dark:border-accent/20 dark:bg-card dark:text-foreground">
            <div className="flex items-center gap-2 text-sm font-medium opacity-90">
              <Compass className="size-[18px]" strokeWidth={2} />
              {t.jobDetail.recommendation}
            </div>
            <p className="mt-3 leading-relaxed">{job.aiRecommendation}</p>
          </PremiumCard>
          <div className="flex flex-col gap-3">
            <PrimaryButton href={`/jobs/${job.id}/resume`}>
              {t.jobDetail.generateResume}
            </PrimaryButton>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-card px-6 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <span className="inline-flex items-center gap-2">
                {t.jobDetail.applyNow}
                <ExternalLink className="size-[18px]" strokeWidth={2} />
              </span>
            </a>
          </div>
        </div>
      </div>
    </CareerShell>
  );
}
