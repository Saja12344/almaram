"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, MapPin } from "lucide-react";
import type { JobListing } from "@/types/career";
import { useCareer } from "@/contexts/career-context";
import {
  getJobOriginalTitle,
  getJobTitle,
  showOriginalTitleSubtitle,
} from "@/lib/job-display";
import { PremiumCard } from "./shell";

function scoreColor(score: number) {
  if (score >= 85)
    return "text-primary bg-primary/10 border-primary/20 dark:text-accent dark:bg-accent/10 dark:border-accent/20";
  if (score >= 70)
    return "text-accent bg-accent/10 border-accent/20";
  return "text-muted-foreground bg-muted border-border";
}

export function MatchScoreBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const { t } = useCareer();

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-2xl border px-3.5 py-2 ${scoreColor(score)} ${className ?? ""}`}
      aria-label={`${t.jobs.matchScore}: ${score}%`}
    >
      <span className="text-base font-semibold tabular-nums leading-none">{score}%</span>
      <span className="text-xs font-medium leading-none opacity-75">{t.jobs.matchScore}</span>
    </div>
  );
}

export function JobCard({ job, index = 0 }: { job: JobListing; index?: number }) {
  const { t, locale } = useCareer();
  const displayTitle = getJobTitle(job, locale);
  const showOriginal = showOriginalTitleSubtitle(job, locale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
    >
      <PremiumCard className="group transition hover:-translate-y-0.5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-lg font-semibold text-foreground">
              {job.companyLogo}
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold tracking-tight">{displayTitle}</h3>
                {job.remote ? (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:text-accent">
                    {t.jobs.remote}
                  </span>
                ) : null}
              </div>
              {showOriginal ? (
                <p className="text-sm text-muted-foreground">
                  <span className="text-xs opacity-70">{t.jobs.asPosted}: </span>
                  {getJobOriginalTitle(job)}
                </p>
              ) : null}
              <p className="text-muted-foreground">{job.company}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-[18px]" strokeWidth={2} />
                  {job.location}
                </span>
                {job.salary ? (
                  <span>
                    {t.jobs.salary}: {job.salary}
                  </span>
                ) : null}
                <span>
                  {t.jobs.posted} {job.postedDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <MatchScoreBadge score={job.matchScore} />
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/jobs/${job.id}`}
                className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                {t.jobs.details}
              </Link>
              <Link
                href={`/jobs/${job.id}/resume`}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-95"
              >
                <FileText className="size-[18px]" strokeWidth={2} />
                {t.jobs.generateResume}
              </Link>
            </div>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
}

export function MatchBadge({ score }: { score: number }) {
  return <MatchScoreBadge score={score} />;
}
