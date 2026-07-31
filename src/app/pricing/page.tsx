import { Suspense } from "react";
import PricingClient from "./pricing-client";
import { CareerShell, PremiumCard } from "@/components/career/shell";

function PricingFallback() {
  return (
    <CareerShell>
      <PremiumCard className="py-16 text-center text-muted-foreground">…</PremiumCard>
    </CareerShell>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<PricingFallback />}>
      <PricingClient />
    </Suspense>
  );
}
