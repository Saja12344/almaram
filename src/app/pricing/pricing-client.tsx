"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { CareerShell, PageIntro, PremiumCard, PrimaryButton } from "@/components/career/shell";
import { useAuth } from "@/contexts/auth-context";
import { useCareer } from "@/contexts/career-context";

export default function PricingPage() {
  const searchParams = useSearchParams();
  const { t, profile, locale } = useCareer();
  const { user, refreshUserDoc } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      refreshUserDoc();
      toast.success(t.pricing.success);
    }
    if (searchParams.get("canceled") === "1") {
      toast.message(t.pricing.canceled);
    }
  }, [searchParams, refreshUserDoc, t.pricing.success, t.pricing.canceled]);

  const proPrice = process.env.NEXT_PUBLIC_TAP_PRO_AMOUNT || "69";

  async function handleUpgrade() {
    if (!user) {
      toast.message(t.pricing.signInToUpgrade);
      window.location.href = "/login";
      return;
    }
    setCheckingOut(true);
    try {
      const res = await fetch("/api/billing/tap/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          lang: locale,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else if (data.error?.includes("not configured"))
        toast.error(t.pricing.paymentNotConfigured);
      else toast.error(data.error || t.auth.errorGeneric);
    } catch {
      toast.error(t.auth.errorGeneric);
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <CareerShell>
      <PageIntro title={t.pricing.title} subtitle={t.pricing.subtitle} />

      <div className="grid gap-6 lg:grid-cols-2">
        <PremiumCard>
          <p className="text-sm font-medium text-muted-foreground">{t.pricing.free}</p>
          <p className="mt-2 text-4xl font-semibold">
            0 {t.pricing.sar}
            <span className="text-base font-normal text-muted-foreground">{t.common.perMonth}</span>
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

        <PremiumCard className="border-primary/25 bg-primary text-primary-foreground">
          <p className="text-sm font-medium opacity-80">{t.pricing.pro}</p>
          <p className="mt-2 text-4xl font-semibold">
            {proPrice} {t.pricing.sar}
            <span className="text-base font-normal opacity-70">{t.common.perMonth}</span>
          </p>
          <p className="mt-1 text-xs opacity-70">{t.pricing.madaAccepted}</p>
          <ul className="mt-6 space-y-3">
            {t.pricing.proFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm opacity-90">
                <Check className="mt-0.5 size-[18px] shrink-0 text-accent-foreground" strokeWidth={2} />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {profile.plan === "pro" ? (
              <p className="text-sm font-medium opacity-80">{t.pricing.current}</p>
            ) : (
              <PrimaryButton
                className="w-full bg-card text-foreground hover:opacity-95"
                onClick={handleUpgrade}
                disabled={checkingOut}
              >
                {checkingOut ? t.pricing.upgrading : t.pricing.upgrade}
              </PrimaryButton>
            )}
          </div>
        </PremiumCard>
      </div>

      {profile.freeResumeUsed && profile.plan === "free" ? (
        <PremiumCard className="mt-6 border-amber-200/80 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30">
          <h3 className="font-semibold text-amber-900 dark:text-amber-200">{t.pricing.limitTitle}</h3>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-300/90">{t.pricing.limitBody}</p>
        </PremiumCard>
      ) : null}
    </CareerShell>
  );
}
