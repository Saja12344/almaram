"use client";

import { useEffect, useState } from "react";
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
import { useAuth } from "@/contexts/auth-context";
import { useCareer } from "@/contexts/career-context";
import type { OptimizedDocuments } from "@/types/career";

export default function ResumePreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const {
    t,
    canGenerateResume,
    canGenerateCover,
    markResumeUsed,
    markCoverUsed,
    saveApplication,
    profile,
    getJobById,
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

    async function generate() {
      try {
        const res = await fetch("/api/jobs/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job,
            profile,
            email: user?.email,
            type: "both",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generation failed");

        setDocs({
          originalResume: data.originalResume,
          optimizedResume: data.optimizedResume,
          diffHighlights: data.diffHighlights,
          coverLetter: data.coverLetter,
          approved: false,
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.auth.errorGeneric);
        router.push(`/jobs/${job!.id}`);
      } finally {
        setLoading(false);
      }
    }

    void generate();
  }, [job, canGenerateResume, profile, user?.email, router, t]);

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
                : "border border-border bg-card text-muted-foreground"
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
        <PrimaryButton
          onClick={() => {
            if (profile.plan === "free") {
              markResumeUsed();
              if (canGenerateCover()) markCoverUsed();
            }
            saveApplication(job.id, {
              jobId: job.id,
              status: "ready",
              resumeVersion: "openai-v1",
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
