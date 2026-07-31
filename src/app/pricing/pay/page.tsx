"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { CareerShell, PageIntro, PremiumCard } from "@/components/career/shell";
import { useAuth } from "@/contexts/auth-context";
import { useCareer } from "@/contexts/career-context";

declare global {
  interface Window {
    Moyasar?: {
      init: (config: Record<string, unknown>) => void;
    };
  }
}

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY || "";
const AMOUNT = Number(process.env.NEXT_PUBLIC_MOYASAR_PRO_AMOUNT_HALALAS || "6900");
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function PayPage() {
  const router = useRouter();
  const { t } = useCareer();
  const { user } = useAuth();
  const initialized = useRef(false);

  function initMoyasar() {
    if (!user || initialized.current || !window.Moyasar || !PUBLISHABLE_KEY) return;
    initialized.current = true;
    window.Moyasar.init({
      element: ".mysr-form",
      amount: AMOUNT,
      currency: "SAR",
      description: "Almaram Pro — monthly",
      publishable_api_key: PUBLISHABLE_KEY,
      callback_url: `${APP_URL}/pricing/callback`,
      methods: ["creditcard", "applepay", "stcpay"],
      supported_networks: ["mada", "visa", "mastercard", "amex"],
      metadata: { firebaseUid: user.uid },
    });
  }

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  useEffect(() => {
    initMoyasar();
  }, [user]);

  if (!PUBLISHABLE_KEY) {
    return (
      <CareerShell>
        <PremiumCard className="text-muted-foreground">{t.pricing.paymentNotConfigured}</PremiumCard>
      </CareerShell>
    );
  }

  return (
    <CareerShell>
      <link rel="stylesheet" href="https://cdn.moyasar.com/moyasar.css" />
      <Script
        src="https://cdn.moyasar.com/moyasar.js"
        strategy="afterInteractive"
        onLoad={initMoyasar}
      />
      <PageIntro title={t.pricing.payTitle} subtitle={t.pricing.paySubtitle} />
      <PremiumCard>
        <p className="mb-6 text-sm text-muted-foreground">
          {t.pricing.pro} · {(AMOUNT / 100).toFixed(0)} {t.pricing.sarPerMonth}
        </p>
        <div className="mysr-form" />
      </PremiumCard>
    </CareerShell>
  );
}
