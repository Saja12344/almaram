const profile = $("Get Profile").first().json || {};
const existingRows = $("Get Existing Applications").all();
const existingIds = new Set(existingRows.map(r => (r.json && r.json.external_id)).filter(Boolean));

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

// Block senior / management roles (IC only)
const seniorBlock = [
  "senior", "staff", "principal", "lead", "manager", "director",
  "head of", "vp ", "vice president", "chief", "distinguished", "architect"
];

const saudiCities = [
  "riyadh", "jeddah", "dammam", "khobar", "al khobar", "dhahran",
  "makkah", "madinah", "neom", "tabuk", "saudi", "ksa"
];
const remoteTerms = ["remote", "work from home", "wfh", "anywhere", "distributed"];
const hybridTerms = ["hybrid"];
const onsiteTerms = ["on-site", "onsite", "on site", "office-based"];

const profileLocs = String(profile.target_locations || "Remote,Riyadh,Jeddah,Dammam,Khobar")
  .toLowerCase()
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const includeRemote = profile.include_remote !== false;
const includeHybrid = profile.include_hybrid !== false;
const includeOnsite = profile.include_onsite !== false;

const maxAgeDays = Number(profile.max_job_age_days || 7);
const maxJobsPerRun = Number(profile.max_jobs_per_run || 30);

const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - maxAgeDays);
cutoff.setHours(0, 0, 0, 0);

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function detectWorkType(locationText, descriptionText) {
  const text = `${locationText} ${descriptionText}`.toLowerCase();
  if (remoteTerms.some(k => text.includes(k))) return "remote";
  if (hybridTerms.some(k => text.includes(k))) return "hybrid";
  if (onsiteTerms.some(k => text.includes(k))) return "onsite";
  return "unknown";
}

const out = [];

for (const item of $input.all()) {
  const j = item.json || {};
  if (!j.external_id || !j.job_title) continue;

  const title = String(j.job_title).toLowerCase();
  const loc = String(j.job_location || "").toLowerCase();
  const desc = String(j.description || "").toLowerCase();
  const fullBlob = `${title} ${loc} ${desc}`;

  // IC titles only — drop Manager / Senior / Staff etc.
  if (seniorBlock.some(k => title.includes(k))) continue;

  const titleMatch = titleGroups.some(g => g.some(k => title.includes(k)));
  if (!titleMatch) continue;

  const posted = parseDate(j.date_posted || j.created_at || j.updated_at);
  if (posted && posted < cutoff) continue;

  const saudiMatch = saudiCities.some(c => fullBlob.includes(c));
  const remoteMatch = includeRemote && remoteTerms.some(t => fullBlob.includes(t));
  const profileLocMatch = profileLocs.some(t => fullBlob.includes(t));

  // Block obvious onsite-only locations outside Saudi unless explicitly remote
  const blockedOnsiteHints = [
    "israel", "tel aviv", "dublin", "berlin", "paris", "toronto",
    "singapore", "sydney", "munich", "amsterdam", "london, uk", "new york"
  ];
  const blockedOnsite = blockedOnsiteHints.some(h => fullBlob.includes(h));
  if (blockedOnsite && !remoteMatch) continue;

  if (!saudiMatch && !remoteMatch && !profileLocMatch) continue;

  const workType = detectWorkType(loc, desc);
  if (workType === "remote" && !includeRemote) continue;
  if (workType === "hybrid" && !includeHybrid) continue;
  if (workType === "onsite" && !includeOnsite) continue;

  if (existingIds.has(j.external_id)) continue;

  out.push({ json: { ...j, work_type: workType, date_posted: posted ? posted.toISOString() : null } });
}

return out.slice(0, maxJobsPerRun);
