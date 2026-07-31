import { NextResponse } from "next/server";
import { extractPdfText, parseResumeText } from "@/lib/career/resume-parser";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI is not configured" }, { status: 503 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractPdfText(buffer);
    if (!rawText.trim()) {
      return NextResponse.json({ error: "Could not read text from PDF" }, { status: 422 });
    }

    const analysis = await parseResumeText(rawText);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Resume parse error:", error);
    const message = error instanceof Error ? error.message : "Parse failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
