"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileUp, Compass } from "lucide-react";
import { AlmaramMark } from "@/components/brand/almaram-logo";
import { CareerShell, PrimaryButton, SecondaryButton } from "@/components/career/shell";
import { FadeIn } from "@/components/career/motion";
import { useCareer } from "@/contexts/career-context";

export default function WelcomePage() {
  const router = useRouter();
  const { t, profile, loadDemo } = useCareer();

  useEffect(() => {
    if (profile.onboardingComplete) router.replace("/jobs");
  }, [profile.onboardingComplete, router]);

  if (profile.onboardingComplete) return null;

  return (
    <CareerShell minimal>
      <div className="grid min-h-[68vh] items-center gap-16 lg:grid-cols-2">
        <FadeIn>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
            <Compass className="size-[18px]" strokeWidth={2} />
            {t.welcome.trust}
          </div>
          <h1 className="mt-8 text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-[3.25rem]">
            {t.welcome.headline}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            {t.welcome.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <PrimaryButton href="/upload">
              <FileUp className="me-2 size-[18px]" strokeWidth={2} />
              {t.welcome.upload}
            </PrimaryButton>
            <SecondaryButton
              onClick={() => {
                loadDemo();
                router.push("/onboarding/analysis");
              }}
            >
              {t.welcome.demo}
            </SecondaryButton>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{t.welcome.uploadHint}</p>
        </FadeIn>

        <FadeIn delay={0.08}>
          <motion.div
            className="relative mx-auto aspect-[4/5] max-w-md"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 rounded-[36px] border border-border bg-card shadow-[var(--shadow-card)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
              <AlmaramMark size={140} />
              <p className="mt-8 text-center text-2xl font-semibold text-foreground">
                {t.brand}
              </p>
              <p className="mt-1 text-center text-muted-foreground">{t.tagline}</p>
              <div className="mt-10 grid w-full grid-cols-2 gap-3">
                {["91%", "88%", "84%", "79%"].map((score) => (
                  <div
                    key={score}
                    className="rounded-2xl border border-border bg-muted/50 p-4 text-center"
                  >
                    <div className="text-2xl font-semibold text-primary dark:text-accent">
                      {score}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t.jobs.matchScore}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </CareerShell>
  );
}
