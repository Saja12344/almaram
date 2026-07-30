import { getDashboardData } from "@/lib/dashboard";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const data = await getDashboardData();
  return NextResponse.json(data);
}
