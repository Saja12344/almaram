import { NextResponse } from "next/server";
import {
  fetchMoyasarPayment,
  isMoyasarConfigured,
  verifyProPayment,
} from "@/lib/moyasar/server";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/user-doc";

export async function POST(request: Request) {
  if (!isMoyasarConfigured()) {
    return NextResponse.json({ error: "Moyasar is not configured" }, { status: 503 });
  }

  try {
    const { paymentId, uid } = (await request.json()) as {
      paymentId?: string;
      uid?: string;
    };

    if (!paymentId || !uid) {
      return NextResponse.json({ error: "Missing paymentId or uid" }, { status: 400 });
    }

    const payment = await fetchMoyasarPayment(paymentId);
    if (!verifyProPayment(payment)) {
      return NextResponse.json({ error: "Payment not valid" }, { status: 402 });
    }

    if (isFirebaseAdminConfigured()) {
      await getAdminDb()
        .doc(`${USERS_COLLECTION}/${uid}`)
        .set(
          {
            plan: "pro",
            moyasarPaymentId: paymentId,
            "careerProfile.plan": "pro",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
    }

    return NextResponse.json({ ok: true, paymentId });
  } catch (error) {
    console.error("Moyasar verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
