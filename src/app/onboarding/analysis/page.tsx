"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Plus, X } from "lucide-react";
import {
  CareerShell,
  PageIntro,
  PremiumCard,
  PrimaryButton,
} from "@/components/career/shell";
import { FadeIn, Stagger, StaggerItem } from "@/components/career/motion";
import { useCareer } from "@/contexts/career-context";

function ChipList({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const router = useRouter();
  const { t, profile, setJobTitles } = useCareer();
  const analysis = profile.analysis;
  const [titles, setTitles] = useState(profile.jobTitles);
  const [newTitle, setNewTitle] = useState("");

  if (!analysis) {
    router.replace("/upload");
    return null;
  }

  const addTitle = () => {
    const value = newTitle.trim();
    if (!value || titles.includes(value)) return;
    setTitles([...titles, value]);
    setNewTitle("");
  };

  const removeTitle = (title: string) => {
    setTitles(titles.filter((t) => t !== title));
  };

  return (
    <CareerShell minimal>
      <PageIntro title={t.analysis.title} subtitle={t.analysis.subtitle} />

      <div className="grid gap-6 lg:grid-cols-5">
        <FadeIn className="lg:col-span-2">
          <PremiumCard className="space-y-6">
            <ChipList label={t.analysis.name} items={[analysis.name]} />
            <ChipList
              label={t.analysis.experience}
              items={[`${analysis.yearsExperience} years`]}
            />
            <ChipList label={t.analysis.education} items={analysis.education} />
            <ChipList label={t.analysis.skills} items={analysis.skills} />
            <ChipList label={t.analysis.projects} items={analysis.projects} />
            <ChipList label={t.analysis.certificates} items={analysis.certificates} />
            <ChipList label={t.analysis.languages} items={analysis.programmingLanguages} />
            <ChipList label={t.analysis.frameworks} items={analysis.frameworks} />
            <ChipList label={t.analysis.softSkills} items={analysis.softSkills} />
          </PremiumCard>
        </FadeIn>

        <FadeIn delay={0.08} className="lg:col-span-3">
          <PremiumCard>
            <h2 className="text-xl font-semibold tracking-tight">{t.analysis.careersTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.analysis.careersHint}</p>

            <Stagger className="mt-6 space-y-3">
              {titles.map((title) => (
                <StaggerItem key={title}>
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
                    <GripVertical className="size-[18px] text-muted-foreground" strokeWidth={2} />
                    <input
                      value={title}
                      onChange={(e) =>
                        setTitles(titles.map((t) => (t === title ? e.target.value : t)))
                      }
                      className="flex-1 bg-transparent text-base font-medium outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeTitle(title)}
                      className="rounded-full p-1 text-muted-foreground transition hover:bg-card hover:text-foreground"
                    >
                      <X className="size-[18px]" strokeWidth={2} />
                    </button>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="mt-4 flex gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t.analysis.addTitle}
                className="h-11 flex-1 rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary/40"
              />
              <button
                type="button"
                onClick={addTitle}
                className="inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-card transition hover:bg-muted"
              >
                <Plus className="size-[18px]" strokeWidth={2} />
              </button>
            </div>

            <div className="mt-8">
              <PrimaryButton
                onClick={() => {
                  setJobTitles(titles);
                  router.push("/onboarding/location");
                }}
              >
                {t.analysis.continue}
              </PrimaryButton>
            </div>
          </PremiumCard>
        </FadeIn>
      </div>
    </CareerShell>
  );
}
