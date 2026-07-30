/**
 * AI prompt templates for n8n OpenAI / LangChain nodes.
 */

function buildMatchScorePrompt(masterResume, job) {
  return `You are an expert technical recruiter evaluating job fit for Saudi Arabia and remote tech roles.

STRICT RULES:
- Score ONLY based on factual overlap between the job description and the master resume.
- NEVER assume skills or experience not explicitly stated in the resume.
- NEVER inflate scores for missing requirements.
- Return valid JSON only.

MASTER RESUME:
"""
${masterResume}
"""

JOB:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Work Type: ${job.workType}
Source: ${job.source}

Description:
"""
${(job.description || '').slice(0, 8000)}
"""

Score dimensions (0-100 total):
- Title & seniority alignment (0-20)
- Core technical skills overlap (0-30)
- Experience relevance (0-25)
- Domain / industry fit (0-10)
- Location & work-type fit for Saudi/Remote (0-15)

Return JSON:
{
  "matchScore": <integer 0-100>,
  "matchedSkills": ["only skills present in BOTH resume and job"],
  "missingSkills": ["required skills in job but NOT in resume"],
  "matchedExperience": ["brief bullets of relevant real experience from resume"],
  "locationFit": "saudi" | "remote" | "both" | "weak",
  "summary": "2-3 sentences explaining the score using only resume facts",
  "recommendation": "apply" | "review" | "skip"
}`;
}

function buildResumePrompt(masterResume, job, matchResult) {
  return `You are an ATS resume optimizer. Create a tailored resume using ONLY facts from the master resume.

ABSOLUTE RULES:
- NEVER invent skills, companies, titles, dates, degrees, or projects.
- NEVER add experience that is not in the master resume.
- You MAY reorder sections, rewrite bullet points for clarity, and mirror keywords from the job description when they truthfully describe existing experience.
- Preserve factual accuracy at all times.
- Output clean Markdown suitable for PDF conversion.

MASTER RESUME:
"""
${masterResume}
"""

TARGET JOB:
${job.title} at ${job.company} — ${job.location}

MATCH ANALYSIS:
${JSON.stringify(matchResult, null, 2)}

JOB KEYWORDS TO MIRROR (only when truthful):
${(matchResult.matchedSkills || []).join(', ')}

Generate a complete ATS-friendly resume in Markdown with sections:
1. Header (name, email, phone, LinkedIn, GitHub, location)
2. Professional Summary (3-4 lines, factual)
3. Skills (prioritize matched skills first)
4. Experience (most relevant roles first, rewritten bullets)
5. Projects (most relevant first)
6. Education

Return ONLY the Markdown resume.`;
}

function buildCoverLetterPrompt(masterResume, job, matchResult) {
  return `Write an ATS-friendly cover letter using ONLY factual information from the master resume.

RULES:
- Never invent experience or skills.
- 3-4 short paragraphs.
- Mention specific matched experience from the analysis.
- Professional tone for ${job.company} — ${job.title} (${job.location}).
- Include Saudi/remote eligibility only if stated in the resume.

MASTER RESUME:
"""
${masterResume}
"""

JOB: ${job.title} at ${job.company}
MATCH SUMMARY: ${matchResult.summary}

Return ONLY the cover letter text (no JSON).`;
}

module.exports = {
  buildMatchScorePrompt,
  buildResumePrompt,
  buildCoverLetterPrompt,
};
