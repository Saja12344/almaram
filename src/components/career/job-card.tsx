"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, FileText, MapPin } from "lucide-react";
import type { JobListing } from "@/types/career";
import { useCareer } from "@/contexts/career-context";
import { PremiumCard } from "./shell";

function scoreColor(score: number) {
  if (score >= 85)
    return "text-primary bg-primary/10 border-primary/20 dark:text-accent dark:bg-accent/10 dark:border-accent/20";
  if (score >= 70)
    return "text-accent bg-accent/10 border-accent/20";
  return "text-muted-foreground bg-muted border-border";
}

export function JobCard({ job, index = 0 }: { job: JobListing; index?: number }) {
  const { t } = useCareer();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
    >
      <PremiumCard className="group transition hover:-translate-y-0.5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-lg font-semibold text-foreground">
              {job.companyLogo}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold tracking-tight">{job.title}</h3>
                {job.remote ? (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:text-accent">
                    {t.jobs.remote}
                  </span>
                ) : null}
              </div>
              <p className="text-muted-foreground">{job.company}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <div className="text-end">
              <p className="text-xs font-medium text-muted-foreground">{t.jobs.matchScore}</p>
              <div
                className={`mt-1 inline-flex rounded-2xl border px-4 py-2 text-sm font-semibold tabular-nums ${scoreColor(job.matchScore)}`}
              >
                {job.matchScore}%
              </div>
            </div>
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
  const { t } = useCareer();
  return (
    <div className="text-end">
      <p className="text-xs font-medium text-muted-foreground">{t.jobs.matchScore}</p>
      <span
        className={`mt-1 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${scoreColor(score)}`}
      >
        {score}%
        <ArrowUpRight className="size-[18px]" strokeWidth={2} />
      </span>
    </div>
  );
}
