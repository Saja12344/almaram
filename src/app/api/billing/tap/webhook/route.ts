import { NextResponse } from "next/server";
import { fetchTapCharge, isTapConfigured, verifyProCharge } from "@/lib/tap/server";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/user-doc";

export async function POST(request: Request) {
  if (!isTapConfigured() || !isFirebaseAdminConfigured()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const payload = (await request.json()) as { id?: string };
    if (!payload.id) {
      return NextResponse.json({ error: "Missing charge id" }, { status: 400 });
    }

    const charge = await fetchTapCharge(payload.id);
    const uid = charge.metadata?.firebaseUid;
    if (!uid || !verifyProCharge(charge, uid)) {
      return NextResponse.json({ ok: true });
    }

    await getAdminDb()
      .doc(`${USERS_COLLECTION}/${uid}`)
      .set(
        {
          plan: "pro",
          tapChargeId: charge.id,
          "careerProfile.plan": "pro",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Tap webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
