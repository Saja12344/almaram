import { NextResponse } from "next/server";
import { toJobProfile } from "@/lib/career/profile-bridge";
import { searchJobsForProfile } from "@/lib/career/search-jobs";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/user-doc";
import type { Plan, UserCareerProfile } from "@/types/career";

export const runtime = "nodejs";
export const maxDuration = 120;

const FREE_LIMIT = 5;
const PRO_LIMIT = 40;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      uid?: string;
      email?: string;
      profile?: UserCareerProfile;
      plan?: Plan;
    };

    const profile = body.profile;
    if (!profile?.analysis?.rawText?.trim()) {
      return NextResponse.json({ error: "Upload and analyze your resume first" }, { status: 400 });
    }

    const plan = body.plan || profile.plan || "free";
    const limit = plan === "pro" ? PRO_LIMIT : FREE_LIMIT;
    const email = body.email || "user@almaram.app";

    const existingIds = new Set(
      (profile.cachedJobs || []).map((j) => j.externalId || j.id)
    );

    const jobProfile = toJobProfile(profile, email, plan);
    const jobs = await searchJobsForProfile(jobProfile, limit, existingIds);
    const fetchedAt = new Date().toISOString();
    const nextProfile: UserCareerProfile = {
      ...profile,
      plan,
      cachedJobs: jobs,
      lastJobFetchAt: fetchedAt,
    };

    if (body.uid && isFirebaseAdminConfigured()) {
      await getAdminDb()
        .doc(`${USERS_COLLECTION}/${body.uid}`)
        .set(
          {
            careerProfile: nextProfile,
            updatedAt: fetchedAt,
          },
          { merge: true }
        );
    }

    return NextResponse.json({ jobs, fetchedAt, limit, plan });
  } catch (error) {
    console.error("Job search error:", error);
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
