import fs from "fs/promises";
import path from "path";
import type { JobProfile } from "@/types";
import { listApplications, upsertApplication, saveApplicationFile, getDismissedJobIds, addDismissedJob } from "@/lib/applications-store";
import { buildCoverLetterPdf, buildResumePdf } from "@/lib/pdf";
import { buildApplicationNotes } from "./application-kit";
import { tailorResume, writeCoverLetter } from "./ai-documents";
import { sendPipelineUpdateEmail } from "./email";
import { fetchAllJobs } from "./fetch-jobs";
import { filterAndDedupeJobs } from "./filter";
import { codeMatchScore } from "./match-score";
import type { PipelineRunResult } from "./types";

const RUNS_PATH = path.join(process.cwd(), "data", "last-run.json");

function slugId(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function saveLastRun(result: PipelineRunResult) {
  await fs.mkdir(path.dirname(RUNS_PATH), { recursive: true });
  await fs.writeFile(RUNS_PATH, JSON.stringify(result, null, 2), "utf8");
}

export async function getLastRun(): Promise<PipelineRunResult | null> {
  try {
    const raw = await fs.readFile(RUNS_PATH, "utf8");
    return JSON.parse(raw) as PipelineRunResult;
  } catch {
    return null;
  }
}

function assertPipelineReady(profile: JobProfile) {
  if (!profile.resumeText?.trim()) {
    throw new Error("Add your resume text in Profile before running the pipeline");
  }
  if (profile.autoGenerateResume !== false && !process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is missing in .env.local — add your OpenAI key and restart the site (npm run site)"
    );
  }
}

export async function runJobPipeline(profile: JobProfile): Promise<PipelineRunResult> {
  assertPipelineReady(profile);

  const runId = `run-${Date.now()}`;
  const startedAt = new Date().toISOString();
  let processed = 0;
  let prepared = 0;
  let skipped = 0;
  let errors = 0;

  const existing = await listApplications();
  const dismissed = await getDismissedJobIds();
  const existingIds = new Set([
    ...existing.filter((a) => a.status !== "error").map((a) => a.externalId),
    ...dismissed,
  ]);

  const allJobs = await fetchAllJobs();
  const filtered = filterAndDedupeJobs(allJobs, profile, existingIds);
  const threshold = profile.matchThreshold || 70;
  const resumeVersion = `tailored-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;

  for (const job of filtered) {
    processed += 1;
    const id = slugId(job.external_id);
    let scored;

    try {
      scored = codeMatchScore(profile, job);
      const score = scored.output.match_score;
      const notes = buildApplicationNotes(profile, scored.output);

      if (score >= threshold && profile.autoGenerateResume !== false) {
        const tailored = await tailorResume(
          profile,
          job,
          scored.output.matched_skills
        );
        const cover =
          profile.generateCoverLetter !== false
            ? await writeCoverLetter(profile, job)
            : "";

        const resumeBuffer = await buildResumePdf({
          company: job.company,
          role: job.job_title,
          content: tailored,
        });
        const coverBuffer = cover
          ? await buildCoverLetterPdf({
              company: job.company,
              role: job.job_title,
              content: cover,
            })
          : null;

        await saveApplicationFile(id, "resume.pdf", resumeBuffer);
        if (coverBuffer) {
          await saveApplicationFile(id, "cover-letter.pdf", coverBuffer);
        }

        await upsertApplication({
          id,
          externalId: job.external_id,
          company: job.company,
          role: job.job_title,
          jobLocation: job.job_location,
          jobUrl: job.job_url,
          source: job.source,
          matchScore: score,
          resumeVersion,
          tailoredResume: tailored,
          coverLetter: cover,
          status: "prepared",
          dateFound: new Date().toISOString(),
          runId,
          notes,
          resumePdfPath: `applications/${id}/resume.pdf`,
          coverLetterPdfPath: coverBuffer
            ? `applications/${id}/cover-letter.pdf`
            : "",
        });
        prepared += 1;
      } else {
        await addDismissedJob(job.external_id);
        skipped += 1;
      }
    } catch (err) {
      errors += 1;
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[pipeline] job error", job.external_id, message);

      const notes = scored
        ? buildApplicationNotes(profile, scored.output, { error: message })
        : JSON.stringify({ error: message });

      await upsertApplication({
        id,
        externalId: job.external_id,
        company: job.company,
        role: job.job_title,
        jobLocation: job.job_location,
        jobUrl: job.job_url,
        source: job.source,
        matchScore: scored?.output.match_score ?? 0,
        resumeVersion: "",
        tailoredResume: "",
        coverLetter: "",
        status: "error",
        dateFound: new Date().toISOString(),
        runId,
        notes,
      }).catch(() => {});
    }
  }

  const finishedAt = new Date().toISOString();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const result: PipelineRunResult = {
    runId,
    startedAt,
    finishedAt,
    processed,
    prepared,
    skipped,
    errors,
    emailSent: false,
    message:
      errors > 0
        ? `Processed ${processed}, prepared ${prepared}, skipped ${skipped}, errors ${errors}`
        : `Processed ${processed}, prepared ${prepared}, skipped ${skipped}`,
  };

  if (profile.email) {
    result.emailSent = await sendPipelineUpdateEmail({
      to: profile.email,
      result,
      appUrl,
    }).catch(() => false);
  }

  await saveLastRun(result);
  return result;
}
