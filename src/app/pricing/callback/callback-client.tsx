"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { CareerShell, PremiumCard } from "@/components/career/shell";
import { PulseLoader } from "@/components/career/motion";
import { useAuth } from "@/contexts/auth-context";
import { useCareer } from "@/contexts/career-context";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";
import { USERS_COLLECTION } from "@/lib/firebase/user-doc";

export default function PaymentCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useCareer();
  const { user, refreshUserDoc } = useAuth();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    const tapId = searchParams.get("tap_id");
    const moyasarId = searchParams.get("id");
    const chargeId = tapId || moyasarId;
    const provider = tapId ? "tap" : "moyasar";

    if (!chargeId) {
      setStatus("error");
      return;
    }
    if (!user) {
      const next = tapId
        ? `/pricing/callback?tap_id=${chargeId}`
        : `/pricing/callback?id=${chargeId}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    async function verify() {
      try {
        const endpoint =
          provider === "tap" ? "/api/billing/tap/verify" : "/api/billing/moyasar/verify";
        const body =
          provider === "tap"
            ? { chargeId, uid: user!.uid }
            : { paymentId: chargeId, uid: user!.uid };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "verify failed");

        if (isFirebaseConfigured()) {
          await setDoc(
            doc(getFirebaseDb(), USERS_COLLECTION, user!.uid),
            {
              plan: "pro",
              ...(provider === "tap"
                ? { tapChargeId: chargeId }
                : { moyasarPaymentId: chargeId }),
              "careerProfile.plan": "pro",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }

        await refreshUserDoc();
        setStatus("done");
        toast.success(t.pricing.success);
        router.replace("/pricing?success=1");
      } catch {
        setStatus("error");
        toast.error(t.auth.errorGeneric);
      }
    }

    void verify();
  }, [searchParams, user, router, refreshUserDoc, t]);

  return (
    <CareerShell>
      <PremiumCard>
        {status === "loading" ? (
          <PulseLoader label={t.pricing.verifyingPayment} />
        ) : status === "error" ? (
          <p className="text-center text-muted-foreground">{t.auth.errorGeneric}</p>
        ) : null}
      </PremiumCard>
    </CareerShell>
  );
}
