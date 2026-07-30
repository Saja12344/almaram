import { listApplications } from "@/lib/applications-store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const applications = await listApplications();
  return NextResponse.json({
    applications,
    source: "local",
    count: applications.length,
  });
}
