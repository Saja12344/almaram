import { ingestPipelineApplication } from "@/lib/ingest";
import type { PipelineApplicationInput } from "@/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function getAppUrl(request: Request) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.JOBPILOT_APP_URL ||
    new URL(request.url).origin
  );
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-jobpilot-secret");
  if (!secret || secret !== process.env.JOBPILOT_INGEST_SECRET) {
    return unauthorized();
  }

  let body: PipelineApplicationInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.external_id || !body.company || !body.job_title) {
    return NextResponse.json(
      { error: "external_id, company, and job_title are required" },
      { status: 400 }
    );
  }

  if (!body.tailored_resume || !body.cover_letter) {
    return NextResponse.json(
      { error: "tailored_resume and cover_letter are required" },
      { status: 400 }
    );
  }

  const record = await ingestPipelineApplication(body);
  const appUrl = getAppUrl(request);

  return NextResponse.json({
    ok: true,
    id: record.id,
    resumePdfUrl: `${appUrl}/api/applications/${record.id}/resume.pdf`,
    coverLetterPdfUrl: `${appUrl}/api/applications/${record.id}/cover-letter.pdf`,
    viewUrl: `${appUrl}/applications`,
  });
}
