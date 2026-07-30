"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CareerShell,
  PageIntro,
  PremiumCard,
  PrimaryButton,
  SecondaryButton,
} from "@/components/career/shell";
import { PulseLoader } from "@/components/career/motion";
import { useCareer } from "@/contexts/career-context";
import { getJobById } from "@/lib/mock/career-data";
import type { OptimizedDocuments } from "@/types/career";

export default function ResumePreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    t,
    canGenerateResume,
    canGenerateCover,
    generateDocuments,
    markResumeUsed,
    markCoverUsed,
    saveApplication,
    profile,
  } = useCareer();
  const job = getJobById(params.id);
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<OptimizedDocuments | null>(null);
  const [tab, setTab] = useState<"optimized" | "original" | "diff" | "cover">("optimized");

  useEffect(() => {
    if (!job) return;
    if (!canGenerateResume(job.matchScore)) {
      router.push("/pricing");
      return;
    }
    const timer = setTimeout(() => {
      setDocs(generateDocuments(job));
      setLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [job, canGenerateResume, generateDocuments, router]);

  if (!job) {
    router.replace("/jobs");
    return null;
  }

  if (loading || !docs) {
    return (
      <CareerShell>
        <PremiumCard>
          <PulseLoader label={t.resume.generating} />
        </PremiumCard>
      </CareerShell>
    );
  }

  const content = {
    original: docs.originalResume,
    optimized: docs.optimizedResume,
    diff: docs.diffHighlights.join("\n\n• "),
    cover: docs.coverLetter,
  }[tab];

  return (
    <CareerShell>
      <PageIntro title={t.resume.title} subtitle={t.resume.subtitle} />
      <p className="mb-6 text-sm text-muted-foreground">{t.resume.rules}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["optimized", t.resume.optimized],
            ["original", t.resume.original],
            ["diff", t.resume.diff],
            ["cover", t.resume.coverLetter],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === key
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <PremiumCard>
        <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {tab === "diff" ? `• ${content}` : content}
        </pre>
      </PremiumCard>

      <div className="mt-6 flex flex-wrap gap-3">
        <SecondaryButton
          onClick={() => {
            navigator.clipboard.writeText(content);
            toast.success("Copied");
          }}
        >
          {t.resume.copy}
        </SecondaryButton>
        <SecondaryButton onClick={() => toast.success("PDF download — connect n8n")}>
          {t.resume.downloadPdf}
        </SecondaryButton>
        <SecondaryButton onClick={() => toast.success("DOCX download — connect n8n")}>
          {t.resume.downloadDocx}
        </SecondaryButton>
        <PrimaryButton
          onClick={() => {
            if (profile.plan === "free") {
              markResumeUsed();
              if (tab === "cover" || canGenerateCover()) markCoverUsed();
            }
            saveApplication(job.id, {
              jobId: job.id,
              status: "ready",
              resumeVersion: "optimized-v1",
              coverLetterUsed: true,
              documents: { ...docs, approved: true },
            });
            router.push(`/jobs/${job.id}/apply`);
          }}
        >
          {t.resume.approve}
        </PrimaryButton>
      </div>
    </CareerShell>
  );
}
