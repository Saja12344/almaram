import type { JobProfile } from "@/types";
import type { NormalizedJob } from "./types";

async function chatCompletion(system: string, user: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${err.slice(0, 120)}`);
  }

  const data = await response.json();
  return String(data.choices?.[0]?.message?.content || "").trim();
}

export async function tailorResume(
  profile: JobProfile,
  job: NormalizedJob,
  matchedSkills: string[]
): Promise<string> {
  return chatCompletion(
    "You are an ATS resume optimizer. STRICT RULES: Never invent experience, skills, employers, dates, or metrics not in the master resume. Only reorder and rephrase EXISTING content. Output plain-text resume.",
    [
      `TARGET JOB: ${job.job_title} at ${job.company}`,
      `JOB DESCRIPTION:\n${job.description}`,
      `RELEVANT KEYWORDS: ${matchedSkills.join(", ")}`,
      `MASTER RESUME:\n${profile.resumeText}`,
    ].join("\n\n")
  );
}

export async function writeCoverLetter(
  profile: JobProfile,
  job: NormalizedJob
): Promise<string> {
  return chatCompletion(
    "Write concise professional cover letters using ONLY facts from the resume. Never fabricate. Under 300 words.",
    [
      `Write a cover letter for ${job.job_title} at ${job.company}.`,
      `Candidate: ${profile.name}`,
      `JOB DESCRIPTION:\n${job.description}`,
      `RESUME:\n${profile.resumeText}`,
    ].join("\n\n")
  );
}
