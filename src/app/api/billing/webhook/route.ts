import { NextResponse } from "next/server";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/user-doc";
import { getStripe } from "@/lib/stripe/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error("Webhook signature error:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getAdminDb();

  async function setPro(uid: string, customerId?: string, subscriptionId?: string) {
    await db.doc(`${USERS_COLLECTION}/${uid}`).set(
      {
        plan: "pro",
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        "careerProfile.plan": "pro",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  async function setFree(uid: string) {
    await db.doc(`${USERS_COLLECTION}/${uid}`).set(
      {
        plan: "free",
        stripeSubscriptionId: null,
        "careerProfile.plan": "free",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid = session.metadata?.firebaseUid;
      if (uid) {
        await setPro(uid, session.customer as string | undefined, session.subscription as string | undefined);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const uid = sub.metadata?.firebaseUid;
      if (uid) await setFree(uid);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
