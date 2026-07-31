const MOYASAR_API = "https://api.moyasar.com/v1";

export interface MoyasarPayment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export function isMoyasarConfigured(): boolean {
  return Boolean(
    process.env.MOYASAR_SECRET_KEY &&
      process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY
  );
}

export function getProAmountHalalas(): number {
  const raw = process.env.MOYASAR_PRO_AMOUNT_HALALAS || "6900";
  return Number.parseInt(raw, 10);
}

function authHeader(): string {
  const key = process.env.MOYASAR_SECRET_KEY;
  if (!key) throw new Error("MOYASAR_SECRET_KEY is not configured.");
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export async function fetchMoyasarPayment(id: string): Promise<MoyasarPayment> {
  const res = await fetch(`${MOYASAR_API}/payments/${id}`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Moyasar fetch failed: ${res.status}`);
  }
  return res.json() as Promise<MoyasarPayment>;
}

export function verifyProPayment(payment: MoyasarPayment): boolean {
  const expected = getProAmountHalalas();
  return (
    payment.status === "paid" &&
    payment.amount === expected &&
    payment.currency === "SAR"
  );
}
