import { NextResponse } from "next/server";
import { fetchTapCharge, isTapConfigured, verifyProCharge } from "@/lib/tap/server";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/user-doc";

export async function POST(request: Request) {
  if (!isTapConfigured()) {
    return NextResponse.json({ error: "Tap is not configured" }, { status: 503 });
  }

  try {
    const { chargeId, uid } = (await request.json()) as {
      chargeId?: string;
      uid?: string;
    };

    if (!chargeId || !uid) {
      return NextResponse.json({ error: "Missing chargeId or uid" }, { status: 400 });
    }

    const charge = await fetchTapCharge(chargeId);
    if (!verifyProCharge(charge, uid)) {
      return NextResponse.json({ error: "Payment not valid" }, { status: 402 });
    }

    if (isFirebaseAdminConfigured()) {
      await getAdminDb()
        .doc(`${USERS_COLLECTION}/${uid}`)
        .set(
          {
            plan: "pro",
            tapChargeId: chargeId,
            "careerProfile.plan": "pro",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
    }

    return NextResponse.json({ ok: true, chargeId });
  } catch (error) {
    console.error("Tap verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
