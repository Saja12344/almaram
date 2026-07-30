"use client";

import { Check } from "lucide-react";
import { CareerShell, PageIntro, PremiumCard, PrimaryButton } from "@/components/career/shell";
import { useCareer } from "@/contexts/career-context";

export default function PricingPage() {
  const { t, profile } = useCareer();

  return (
    <CareerShell>
      <PageIntro title={t.pricing.title} subtitle={t.pricing.subtitle} />

      <div className="grid gap-6 lg:grid-cols-2">
        <PremiumCard>
          <p className="text-sm font-medium text-muted-foreground">{t.pricing.free}</p>
          <p className="mt-2 text-4xl font-semibold">
            $0<span className="text-base font-normal text-muted-foreground">{t.common.perMonth}</span>
          </p>
          <ul className="mt-6 space-y-3">
            {t.pricing.freeFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-[18px] shrink-0 text-primary dark:text-accent" strokeWidth={2} />
                {feature}
              </li>
            ))}
          </ul>
          {profile.plan === "free" ? (
            <p className="mt-8 text-sm font-medium text-muted-foreground">{t.pricing.current}</p>
          ) : null}
        </PremiumCard>

        <PremiumCard className="border-primary/25 bg-[#111827] text-white dark:border-border dark:bg-card dark:text-foreground">
          <p className="text-sm font-medium text-white/70 dark:text-muted-foreground">{t.pricing.pro}</p>
          <p className="mt-2 text-4xl font-semibold">
            $19<span className="text-base font-normal text-white/60 dark:text-muted-foreground">{t.common.perMonth}</span>
          </p>
          <ul className="mt-6 space-y-3">
            {t.pricing.proFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-white/90 dark:text-muted-foreground">
                <Check className="mt-0.5 size-[18px] shrink-0 text-accent" strokeWidth={2} />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <PrimaryButton className="w-full bg-white text-primary hover:opacity-95 dark:bg-accent dark:text-accent-foreground">
              {t.pricing.upgrade}
            </PrimaryButton>
          </div>
        </PremiumCard>
      </div>

      {profile.freeResumeUsed ? (
        <PremiumCard className="mt-6 border-amber-200/80 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30">
          <h3 className="font-semibold text-amber-900 dark:text-amber-200">{t.pricing.limitTitle}</h3>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-300/90">{t.pricing.limitBody}</p>
        </PremiumCard>
      ) : null}
    </CareerShell>
  );
}
