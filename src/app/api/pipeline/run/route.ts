import { getJobProfile } from "@/lib/profile-store";
import { runJobPipeline } from "@/lib/pipeline/run";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
  try {
    const profile = await getJobProfile();
    const result = await runJobPipeline(profile);
    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Pipeline run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
