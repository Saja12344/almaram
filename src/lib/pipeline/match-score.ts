import type { JobProfile } from "@/types";
import type { MatchOutput, NormalizedJob, ScoredJob } from "./types";

const TITLE_GROUPS = [
  ["software engineer", "software developer"],
  ["ai engineer", "artificial intelligence engineer", "ai automation engineer"],
  ["machine learning", "ml engineer"],
  ["backend engineer", "back end engineer", "back-end engineer"],
  ["full stack", "fullstack"],
  ["mobile developer", "ios developer", "ios engineer"],
  ["python developer"],
  ["llm engineer", "prompt engineer"],
];

const SAUDI_CITIES = [
  "riyadh", "jeddah", "dammam", "khobar", "al khobar", "dhahran",
  "makkah", "madinah", "neom", "tabuk", "saudi", "ksa",
];
const REMOTE_TERMS = ["remote", "work from home", "wfh", "anywhere", "distributed"];

const TECH_HINTS = [
  "python", "javascript", "typescript", "java", "react", "node.js", "node",
  "aws", "docker", "kubernetes", "sql", "postgresql", "mongodb", "redis",
  "fastapi", "django", "flask", "llm", "gpt", "openai", "machine learning",
  "deep learning", "tensorflow", "pytorch", "swift", "swiftui", "kotlin", "go", "golang",
  "rust", "api", "microservices", "git", "ci/cd", "azure", "gcp", "linux",
  "next.js", "vue", "angular", "graphql", "kafka", "spark", "nlp", "rag",
  "ios", "xcode", "firebase", "mvvm", "accessibility", "vision framework",
  "flutter", "dart", "tailwind", "vite", "express",
];

export function codeMatchScore(profile: JobProfile, job: NormalizedJob): ScoredJob {
  const resumeText = (profile.resumeText || "").toLowerCase();
  const jobTitle = job.job_title.toLowerCase();
  const jobDesc = (job.description || "").toLowerCase();
  const jobLoc = (job.job_location || "").toLowerCase();
  const blob = `${jobTitle} ${jobDesc} ${jobLoc}`;

  const profileSkills = profile.skills.map((s) => s.toLowerCase().trim()).filter(Boolean);
  const candidateTerms = new Set<string>(profileSkills);
  for (const hint of TECH_HINTS) {
    if (resumeText.includes(hint)) candidateTerms.add(hint);
  }

  const matched_skills: string[] = [];
  const missing_skills: string[] = [];

  for (const term of candidateTerms) {
    if (term.length < 2) continue;
    if (blob.includes(term)) matched_skills.push(term);
  }
  for (const hint of TECH_HINTS) {
    if (blob.includes(hint) && !resumeText.includes(hint) && !missing_skills.includes(hint)) {
      missing_skills.push(hint);
    }
  }

  let titleScore = 0;
  if (TITLE_GROUPS.some((g) => g.some((k) => jobTitle.includes(k)))) titleScore = 18;

  const profileTitles = [
    ...profile.jobTitles,
    ...(profile.targetTitles || "").split(","),
  ]
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (profileTitles.some((t) => jobTitle.includes(t))) titleScore = 25;

  const skillScore = Math.min(40, matched_skills.length * 6);
  const expScore = Math.min(20, matched_skills.length * 2);

  let locScore = 5;
  if (SAUDI_CITIES.some((c) => blob.includes(c))) locScore = 15;
  else if (REMOTE_TERMS.some((t) => blob.includes(t))) locScore = 12;
  else if (!jobLoc.trim()) locScore = 8;

  let match_score = Math.min(100, Math.round(titleScore + skillScore + expScore + locScore));
  if (missing_skills.length >= 6) match_score = Math.max(0, match_score - 12);
  else if (missing_skills.length >= 3) match_score = Math.max(0, match_score - 5);

  const output: MatchOutput = {
    match_score,
    matched_skills,
    missing_skills: missing_skills.slice(0, 15),
    required_keywords: missing_skills.slice(0, 10),
    summary: [
      `Code match ${match_score}/100.`,
      matched_skills.length
        ? `Matched: ${matched_skills.slice(0, 10).join(", ")}.`
        : "No strong skill overlap.",
    ].join(" "),
    scorer: "code",
  };

  return { ...job, output };
}
