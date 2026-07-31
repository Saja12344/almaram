import { NextResponse } from "next/server";
import { sendJobDigestEmail } from "@/lib/career/digest-email";
import { toJobProfile } from "@/lib/career/profile-bridge";
import { searchJobsForProfile } from "@/lib/career/search-jobs";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { USERS_COLLECTION, type UserDocument } from "@/lib/firebase/user-doc";

export const runtime = "nodejs";
export const maxDuration = 300;

function isDigestHour(time: string, timezone: string): boolean {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const now = formatter.format(new Date());
    const [h, m] = time.split(":");
    const [nh, nm] = now.split(":");
    return nh === h?.padStart(2, "0") && nm === m?.padStart(2, "0");
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://maram-sa.vercel.app";
  const db = getAdminDb();
  const snap = await db.collection(USERS_COLLECTION).get();
  let sent = 0;
  let skipped = 0;

  for (const doc of snap.docs) {
    const data = doc.data() as UserDocument;
    const profile = data.careerProfile;
    const digest = profile.digest;

    if (data.plan !== "pro" || !digest?.enabled || !data.email) {
      skipped += 1;
      continue;
    }

    if (!isDigestHour(digest.time || "08:00", digest.timezone || "Asia/Riyadh")) {
      skipped += 1;
      continue;
    }

    if (!profile.analysis?.rawText?.trim()) {
      skipped += 1;
      continue;
    }

    try {
      const existingIds = new Set(
        (profile.cachedJobs || []).map((j) => j.externalId || j.id)
      );
      const jobProfile = toJobProfile(profile, data.email, "pro");
      const jobs = await searchJobsForProfile(jobProfile, 15, existingIds);
      const fetchedAt = new Date().toISOString();

      await doc.ref.set(
        {
          careerProfile: {
            ...profile,
            cachedJobs: jobs,
            lastJobFetchAt: fetchedAt,
          },
          updatedAt: fetchedAt,
        },
        { merge: true }
      );

      const ok = await sendJobDigestEmail({
        to: data.email,
        jobs,
        appUrl,
        name: profile.analysis.name,
      });
      if (ok) sent += 1;
    } catch (err) {
      console.error("[digest] user error", doc.id, err);
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, users: snap.size });
}
