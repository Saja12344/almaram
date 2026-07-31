import { Suspense } from "react";
import PaymentCallbackClient from "./callback-client";
import { CareerShell, PremiumCard } from "@/components/career/shell";

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <CareerShell>
          <PremiumCard className="py-16 text-center text-muted-foreground">…</PremiumCard>
        </CareerShell>
      }
    >
      <PaymentCallbackClient />
    </Suspense>
  );
}
