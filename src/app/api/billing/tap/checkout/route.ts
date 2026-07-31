import { NextResponse } from "next/server";
import { createTapCharge, isTapConfigured } from "@/lib/tap/server";

export async function POST(request: Request) {
  if (!isTapConfigured()) {
    return NextResponse.json({ error: "Tap is not configured" }, { status: 503 });
  }

  try {
    const { uid, email, displayName, lang } = (await request.json()) as {
      uid?: string;
      email?: string;
      displayName?: string | null;
      lang?: "ar" | "en";
    };

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing uid or email" }, { status: 400 });
    }

    const charge = await createTapCharge({ uid, email, displayName, lang });
    const url = charge.transaction?.url;
    if (!url) {
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 502 });
    }

    return NextResponse.json({ url, chargeId: charge.id });
  } catch (error) {
    console.error("Tap checkout error:", error);
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
