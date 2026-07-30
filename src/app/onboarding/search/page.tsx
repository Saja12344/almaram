"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CareerShell, PremiumCard } from "@/components/career/shell";
import { PulseLoader } from "@/components/career/motion";
import { useCareer } from "@/contexts/career-context";

export default function SearchPage() {
  const router = useRouter();
  const { t, completeOnboarding } = useCareer();

  useEffect(() => {
    const timer = setTimeout(() => {
      completeOnboarding();
      router.push("/jobs");
    }, 2800);
    return () => clearTimeout(timer);
  }, [completeOnboarding, router]);

  return (
    <CareerShell minimal>
      <PremiumCard>
        <PulseLoader label={t.search.title} hint={t.search.subtitle} />
        <p className="text-center text-sm text-muted-foreground">{t.search.sources}</p>
      </PremiumCard>
    </CareerShell>
  );
}
