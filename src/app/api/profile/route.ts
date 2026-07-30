import { getJobProfile, saveJobProfile } from "@/lib/profile-store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const profile = await getJobProfile();
  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile = await saveJobProfile(body);
    return NextResponse.json({ profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
