import { buildCoverLetterPdf, buildResumePdf } from "@/lib/pdf";
import {
  saveApplicationFile,
  upsertApplication,
} from "@/lib/applications-store";
import type { PipelineApplication, PipelineApplicationInput } from "@/types";

function slugId(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function ingestPipelineApplication(
  input: PipelineApplicationInput
): Promise<PipelineApplication> {
  const id = slugId(input.external_id || `${input.company}-${input.job_title}`);
  const resumeBuffer = await buildResumePdf({
    company: input.company,
    role: input.job_title,
    content: input.tailored_resume,
  });
  const coverBuffer = await buildCoverLetterPdf({
    company: input.company,
    role: input.job_title,
    content: input.cover_letter,
  });

  await saveApplicationFile(id, "resume.pdf", resumeBuffer);
  await saveApplicationFile(id, "cover-letter.pdf", coverBuffer);

  return upsertApplication({
    id,
    externalId: input.external_id,
    company: input.company,
    role: input.job_title,
    jobLocation: input.job_location || "",
    jobUrl: input.job_url || "",
    source: input.source || "",
    matchScore: Number(input.match_score) || 0,
    resumeVersion: input.resume_version || "",
    tailoredResume: input.tailored_resume,
    coverLetter: input.cover_letter,
    status: "prepared",
    dateFound: input.date_found || new Date().toISOString(),
    runId: input.run_id || "",
    notes: input.notes || "",
    resumePdfPath: `applications/${id}/resume.pdf`,
    coverLetterPdfPath: `applications/${id}/cover-letter.pdf`,
  });
}
