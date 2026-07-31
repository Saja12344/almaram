import { NextResponse } from "next/server";
import { getAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/user-doc";
import type { UserCareerProfile } from "@/types/career";

export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const snap = await getAdminDb().doc(`${USERS_COLLECTION}/${decoded.uid}`).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(snap.data());
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const body = (await request.json()) as { careerProfile: UserCareerProfile };
    await getAdminDb()
      .doc(`${USERS_COLLECTION}/${decoded.uid}`)
      .set(
        {
          careerProfile: body.careerProfile,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
