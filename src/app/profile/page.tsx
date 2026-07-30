"use client";

import { CareerShell, PageIntro, PremiumCard, PrimaryButton } from "@/components/career/shell";
import { useCareer } from "@/contexts/career-context";

export default function ProfilePage() {
  const { t, profile, setSalaryExpectation } = useCareer();
  const analysis = profile.analysis;

  return (
    <CareerShell>
      <PageIntro title={t.profile.title} subtitle={t.profile.subtitle} />

      <div className="grid gap-6 lg:grid-cols-2">
        <PremiumCard>
          <h3 className="font-semibold">{t.profile.masterResume}</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {analysis?.rawText || "Upload your resume to populate this section."}
          </p>
        </PremiumCard>

        <PremiumCard className="space-y-6">
          <div>
            <h3 className="font-semibold">{t.profile.jobTitles}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.jobTitles.map((title) => (
                <span
                  key={title}
                  className="rounded-full bg-muted px-3 py-1 text-sm text-foreground"
                >
                  {title}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold">{t.profile.countries}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.location.countries.map((c) => (
                <span key={c} className="rounded-full bg-muted px-3 py-1 text-sm text-foreground">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="font-semibold">{t.profile.salary}</label>
            <input
              value={profile.salaryExpectation}
              onChange={(e) => setSalaryExpectation(e.target.value)}
              placeholder="e.g. SAR 15,000 – 20,000"
              className="mt-3 h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary/40"
            />
          </div>
          <PrimaryButton onClick={() => {}}>{t.profile.save}</PrimaryButton>
        </PremiumCard>
      </div>
    </CareerShell>
  );
}
