const TAP_API = "https://api.tap.company/v2";

export interface TapCharge {
  id: string;
  status: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
  transaction?: { url?: string };
}

export function isTapConfigured(): boolean {
  return Boolean(process.env.TAP_SECRET_KEY);
}

export function getProAmountSar(): number {
  const raw = process.env.TAP_PRO_AMOUNT || "69";
  return Number.parseFloat(raw);
}

function authHeader(): string {
  const key = process.env.TAP_SECRET_KEY;
  if (!key) throw new Error("TAP_SECRET_KEY is not configured.");
  return `Bearer ${key}`;
}

export async function createTapCharge(input: {
  uid: string;
  email: string;
  displayName?: string | null;
  lang?: "ar" | "en";
}): Promise<TapCharge> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const amount = getProAmountSar();
  const name = input.displayName?.trim() || input.email.split("@")[0] || "Customer";

  const body: Record<string, unknown> = {
    amount,
    currency: "SAR",
    customer_initiated: true,
    threeDSecure: true,
    save_card: false,
    description: "Almaram Pro — monthly",
    metadata: { firebaseUid: input.uid },
    reference: {
      transaction: `pro_${input.uid}_${Date.now()}`,
      order: input.uid,
    },
    customer: {
      first_name: name,
      email: input.email,
      phone: { country_code: "966", number: "500000000" },
    },
    source: { id: "src_all" },
    redirect: { url: `${appUrl}/pricing/callback` },
    post: { url: `${appUrl}/api/billing/tap/webhook` },
  };

  if (process.env.TAP_MERCHANT_ID) {
    body.merchant = { id: process.env.TAP_MERCHANT_ID };
  }

  const res = await fetch(`${TAP_API}/charges/`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      accept: "application/json",
      "content-type": "application/json",
      lang_code: input.lang === "ar" ? "ar" : "en",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tap create charge failed: ${res.status} ${err}`);
  }

  return res.json() as Promise<TapCharge>;
}

export async function fetchTapCharge(id: string): Promise<TapCharge> {
  const res = await fetch(`${TAP_API}/charges/${id}`, {
    headers: { Authorization: authHeader(), accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Tap fetch charge failed: ${res.status}`);
  }
  return res.json() as Promise<TapCharge>;
}

export function verifyProCharge(charge: TapCharge, uid: string): boolean {
  const expected = getProAmountSar();
  const amountOk = Math.abs(Number(charge.amount) - expected) < 0.001;
  return (
    charge.status === "CAPTURED" &&
    charge.currency === "SAR" &&
    amountOk &&
    charge.metadata?.firebaseUid === uid
  );
}
