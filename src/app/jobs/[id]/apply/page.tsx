"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { CareerShell, PageIntro, PremiumCard, PrimaryButton } from "@/components/career/shell";
import { useCareer } from "@/contexts/career-context";
import { getJobById } from "@/lib/mock/career-data";

export default function ApplyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, getApplication } = useCareer();
  const job = getJobById(params.id);
  const application = getApplication(params.id);

  if (!job) {
    router.replace("/jobs");
    return null;
  }

  const rows = [
    [t.apply.applyLink, job.applyUrl],
    [t.apply.companySite, job.applyUrl],
    [t.apply.source, job.source],
    [t.apply.match, `${job.matchScore}%`],
    [t.apply.resumeVersion, application?.resumeVersion || "—"],
    [t.apply.coverLetter, application?.coverLetterUsed ? "Yes" : "—"],
    [t.apply.status, t.apply.ready],
  ];

  return (
    <CareerShell>
      <PageIntro title={t.apply.title} subtitle={job.title + " · " + job.company} />

      <PremiumCard className="space-y-4">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-1 border-b border-border pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            {label === t.apply.applyLink ? (
              <a
                href={String(value)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
              >
                {value}
                <ExternalLink className="size-[18px]" strokeWidth={2} />
              </a>
            ) : (
              <span className="text-sm font-medium text-foreground">{value}</span>
            )}
          </div>
        ))}
      </PremiumCard>

      <div className="mt-6 rounded-[24px] border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        {t.apply.autoApplySoon}
      </div>

      <div className="mt-6 flex gap-3">
        <PrimaryButton href={job.applyUrl}>{t.jobDetail.applyNow}</PrimaryButton>
        <Link
          href="/jobs"
          className="inline-flex h-12 items-center rounded-2xl px-6 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          {t.common.back}
        </Link>
      </div>
    </CareerShell>
  );
}
