// Deterministic match score — NO AI. Compares job vs resume_text only.
const profile = $("Get Profile").first().json || {};
const job = $input.item.json || {};

const resumeText = String(profile.resume_text || "").toLowerCase();
const jobTitle = String(job.job_title || "").toLowerCase();
const jobDesc = String(job.description || "").toLowerCase();
const jobLoc = String(job.job_location || "").toLowerCase();
const blob = `${jobTitle} ${jobDesc} ${jobLoc}`;

const titleGroups = [
  ["software engineer", "software developer"],
  ["ai engineer", "artificial intelligence engineer", "ai automation engineer"],
  ["machine learning", "ml engineer"],
  ["backend engineer", "back end engineer", "back-end engineer"],
  ["full stack", "fullstack"],
  ["mobile developer", "ios developer", "ios engineer"],
  ["python developer"],
  ["llm engineer", "prompt engineer"]
];

const saudiCities = [
  "riyadh", "jeddah", "dammam", "khobar", "al khobar", "dhahran",
  "makkah", "madinah", "neom", "tabuk", "saudi", "ksa"
];
const remoteTerms = ["remote", "work from home", "wfh", "anywhere", "distributed"];

// Skills explicitly listed in profile (comma string or array)
let profileSkills = [];
if (Array.isArray(profile.skills)) {
  profileSkills = profile.skills.map((s) => String(s).toLowerCase().trim()).filter(Boolean);
} else if (typeof profile.skills === "string") {
  profileSkills = profile.skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

// Extra tokens only if they appear in resume_text (never invent)
const TECH_HINTS = [
  "python", "javascript", "typescript", "java", "react", "node.js", "node",
  "aws", "docker", "kubernetes", "sql", "postgresql", "mongodb", "redis",
  "fastapi", "django", "flask", "llm", "gpt", "openai", "machine learning",
  "deep learning", "tensorflow", "pytorch", "swift", "kotlin", "go", "golang",
  "rust", "api", "microservices", "git", "ci/cd", "azure", "gcp", "linux",
  "next.js", "vue", "angular", "graphql", "kafka", "spark", "nlp", "rag"
];

const candidateTerms = new Set([...profileSkills]);
for (const hint of TECH_HINTS) {
  if (resumeText.includes(hint)) candidateTerms.add(hint);
}

const matched_skills = [];
const missing_skills = [];

for (const term of candidateTerms) {
  if (term.length < 2) continue;
  if (blob.includes(term)) matched_skills.push(term);
}

for (const hint of TECH_HINTS) {
  if (blob.includes(hint) && !resumeText.includes(hint) && !missing_skills.includes(hint)) {
    missing_skills.push(hint);
  }
}

// ── Title fit (0–25) ──
let titleScore = 0;
if (titleGroups.some((g) => g.some((k) => jobTitle.includes(k)))) titleScore = 18;

const profileTitles = String(profile.target_titles || profile.job_titles || "")
  .toLowerCase()
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
if (profileTitles.some((t) => jobTitle.includes(t))) titleScore = 25;

// ── Skills overlap (0–40) ──
const skillScore = Math.min(40, matched_skills.length * 6);

// ── Experience / keyword density (0–20) ──
const expScore = Math.min(20, matched_skills.length * 2);

// ── Location fit (0–15) ──
let locScore = 5;
if (saudiCities.some((c) => blob.includes(c))) locScore = 15;
else if (remoteTerms.some((t) => blob.includes(t))) locScore = 12;
else if (!jobLoc.trim()) locScore = 8;

let match_score = Math.min(100, Math.round(titleScore + skillScore + expScore + locScore));

// Penalty if job asks for many skills not in resume
if (missing_skills.length >= 6) match_score = Math.max(0, match_score - 12);
else if (missing_skills.length >= 3) match_score = Math.max(0, match_score - 5);

const summary = [
  `Code match ${match_score}/100.`,
  `Title ${titleScore}/25, skills ${skillScore}/40, experience ${expScore}/20, location ${locScore}/15.`,
  matched_skills.length
    ? `Matched: ${matched_skills.slice(0, 10).join(", ")}.`
    : "No strong skill overlap found.",
  missing_skills.length
    ? `Missing from resume: ${missing_skills.slice(0, 6).join(", ")}.`
    : ""
].filter(Boolean).join(" ");

return {
  json: {
    ...job,
    output: {
      match_score,
      matched_skills,
      missing_skills: missing_skills.slice(0, 15),
      required_keywords: missing_skills.slice(0, 10),
      summary,
      scorer: "code"
    }
  }
};
