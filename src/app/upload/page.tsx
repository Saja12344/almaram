"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import { CareerShell, PageIntro, PremiumCard } from "@/components/career/shell";
import { PulseLoader } from "@/components/career/motion";
import { useCareer } from "@/contexts/career-context";
import { DEMO_ANALYSIS } from "@/lib/mock/career-data";

export default function UploadPage() {
  const router = useRouter();
  const { t, setAnalysis } = useCareer();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== "application/pdf") return;
      setLoading(true);
      setTimeout(() => {
        setAnalysis({ ...DEMO_ANALYSIS, rawText: `Uploaded: ${file.name}` });
        router.push("/onboarding/analysis");
      }, 2200);
    },
    [router, setAnalysis]
  );

  if (loading) {
    return (
      <CareerShell minimal>
        <PremiumCard>
          <PulseLoader label={t.upload.analyzing} hint={t.upload.analyzingHint} />
        </PremiumCard>
      </CareerShell>
    );
  }

  return (
    <CareerShell minimal>
      <PageIntro title={t.upload.title} subtitle={t.upload.subtitle} />
      <PremiumCard>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className={`flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed transition ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:border-primary/30"
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
            <Upload className="size-7" strokeWidth={2} />
          </div>
          <p className="mt-6 text-xl font-medium text-foreground">{t.upload.drop}</p>
          <p className="mt-2 text-muted-foreground">{t.upload.or}</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
            <FileText className="size-4" />
            {t.upload.pdfOnly}
          </p>
        </label>
      </PremiumCard>
    </CareerShell>
  );
}
