import fs from "fs/promises";
import {
  getApplication,
  getApplicationFilePath,
} from "@/lib/applications-store";
import { buildCoverLetterPdf, buildResumePdf } from "@/lib/pdf";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type FileKind = "resume.pdf" | "cover-letter.pdf";

const FILE_MAP: Record<string, FileKind> = {
  "resume.pdf": "resume.pdf",
  "cover-letter.pdf": "cover-letter.pdf",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; file: string }> }
) {
  const { id, file } = await context.params;
  const fileName = FILE_MAP[file];

  if (!fileName) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const app = await getApplication(id);
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const diskPath = getApplicationFilePath(id, fileName);
    try {
      const buffer = await fs.readFile(diskPath);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename=\"${fileName}\"`,
          "Cache-Control": "private, max-age=300",
        },
      });
    } catch {
      // fall through to generate from stored text
    }

    const isResume = fileName === "resume.pdf";
    const content = isResume ? app.tailoredResume : app.coverLetter;

    if (!content.trim()) {
      return NextResponse.json(
        { error: "No document available for this job" },
        { status: 404 }
      );
    }

    const buffer = isResume
      ? await buildResumePdf({
          company: app.company,
          role: app.role,
          content,
        })
      : await buildCoverLetterPdf({
          company: app.company,
          role: app.role,
          content,
        });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=\"${fileName}\"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
