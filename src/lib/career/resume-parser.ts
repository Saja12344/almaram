import type { ResumeAnalysis } from "@/types/career";

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
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  return String(data.choices?.[0]?.message?.content || "").trim();
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return String(text || "").trim();
}

export async function parseResumeText(rawText: string): Promise<ResumeAnalysis> {
  const trimmed = rawText.slice(0, 14000);
  const json = await chatCompletion(
    `Extract structured data from a resume. Return JSON only with keys:
name (string), yearsExperience (number), education (string[]), skills (string[]),
projects (string[]), certificates (string[]), programmingLanguages (string[]),
frameworks (string[]), softSkills (string[]), suggestedJobTitles (string[]).
Use only facts present in the resume. suggestedJobTitles: 3-5 roles that fit the candidate.`,
    trimmed
  );

  const data = JSON.parse(json) as Partial<ResumeAnalysis> & {
    suggestedJobTitles?: string[];
  };

  return {
    name: data.name || "Candidate",
    yearsExperience: Number(data.yearsExperience) || 0,
    education: data.education || [],
    skills: data.skills || [],
    projects: data.projects || [],
    certificates: data.certificates || [],
    programmingLanguages: data.programmingLanguages || [],
    frameworks: data.frameworks || [],
    softSkills: data.softSkills || [],
    rawText: trimmed,
    suggestedJobTitles: data.suggestedJobTitles || [],
  };
}
