"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CareerShell, PremiumCard } from "@/components/career/shell";
import { PulseLoader } from "@/components/career/motion";
import { useAuth } from "@/contexts/auth-context";
import { useCareer } from "@/contexts/career-context";

export default function SearchPage() {
  const router = useRouter();
  const { t, searchJobs, completeOnboarding } = useCareer();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const count = await searchJobs();
        completeOnboarding();
        if (count === 0) {
          toast.message(t.search.noResults);
        }
        router.push("/jobs");
      } catch (err) {
        const msg = err instanceof Error ? err.message : t.auth.errorGeneric;
        setError(msg);
        toast.error(msg);
      }
    }
    void run();
  }, [searchJobs, completeOnboarding, router, t]);

  return (
    <CareerShell minimal>
      <PremiumCard>
        {error ? (
          <p className="text-center text-muted-foreground">{error}</p>
        ) : (
          <>
            <PulseLoader label={t.search.title} hint={t.search.subtitle} />
            <p className="text-center text-sm text-muted-foreground">{t.search.sources}</p>
            {!user ? (
              <p className="mt-4 text-center text-xs text-muted-foreground">{t.search.guestHint}</p>
            ) : null}
          </>
        )}
      </PremiumCard>
    </CareerShell>
  );
}
