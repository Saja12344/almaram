import { NextResponse } from "next/server";
import { toNormalizedJob } from "@/lib/career/job-mapper";
import { toJobProfile } from "@/lib/career/profile-bridge";
import { tailorResume, writeCoverLetter } from "@/lib/pipeline/ai-documents";
import type { JobListing, UserCareerProfile } from "@/types/career";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI is not configured" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      job: JobListing;
      profile: UserCareerProfile;
      email?: string;
      type?: "resume" | "cover" | "both";
    };

    if (!body.job || !body.profile?.analysis?.rawText) {
      return NextResponse.json({ error: "Missing job or resume" }, { status: 400 });
    }

    const jobProfile = toJobProfile(body.profile, body.email || "user@almaram.app");
    const normalized = toNormalizedJob(body.job);
    const type = body.type || "both";

    let optimizedResume = "";
    let coverLetter = "";

    if (type === "resume" || type === "both") {
      optimizedResume = await tailorResume(
        jobProfile,
        normalized,
        body.job.matchedSkills
      );
    }
    if (type === "cover" || type === "both") {
      coverLetter = await writeCoverLetter(jobProfile, normalized);
    }

    return NextResponse.json({
      originalResume: body.profile.analysis.rawText,
      optimizedResume,
      coverLetter,
      diffHighlights: [
        "Tailored with OpenAI from your real resume",
        "Keywords from job description applied",
        `Highlighted: ${body.job.matchedSkills.slice(0, 4).join(", ")}`,
      ],
    });
  } catch (error) {
    console.error("Generate documents error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
