import type { JobProfile } from "@/types";
import type { MatchOutput } from "./types";

export function buildApplicationNotes(
  profile: JobProfile,
  scored: MatchOutput,
  extra?: Record<string, unknown>
) {
  return JSON.stringify({
    application_fields: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone || "",
      linkedin: profile.linkedin,
      github: profile.github,
      portfolio: profile.portfolio,
    },
    matched_skills: scored.matched_skills,
    missing_skills: scored.missing_skills,
    required_keywords: scored.required_keywords,
    ai_summary: scored.summary,
    ...extra,
  });
}

export function parseApplicationNotes(notes: string) {
  try {
    return JSON.parse(notes) as {
      application_fields?: Record<string, string>;
      matched_skills?: string[];
      missing_skills?: string[];
      required_keywords?: string[];
      ai_summary?: string;
      error?: string;
    };
  } catch {
    return { raw: notes };
  }
}
