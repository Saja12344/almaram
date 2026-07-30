import type { JobProfile } from "@/types";
import type { NormalizedJob } from "./types";

const TITLE_GROUPS = [
  ["software engineer", "software developer"],
  ["ai engineer", "artificial intelligence engineer", "ai automation engineer"],
  ["machine learning", "ml engineer"],
  ["backend engineer", "back end engineer", "back-end engineer"],
  ["full stack", "fullstack"],
  ["mobile developer", "ios developer", "ios engineer"],
  ["python developer"],
  ["llm engineer", "prompt engineer"],
  ["product engineer"],
  ["application support engineer", "support engineer"],
];

const SENIOR_BLOCK = [
  "senior", "staff", "principal", "lead", "manager", "director",
  "head of", "vp ", "vice president", "chief", "distinguished", "architect",
];

const SAUDI_CITIES = [
  "riyadh", "jeddah", "dammam", "khobar", "al khobar", "dhahran",
  "makkah", "madinah", "neom", "tabuk", "saudi", "ksa", "kingdom of saudi",
];

const REMOTE_TERMS = ["remote", "work from home", "wfh", "anywhere", "distributed"];
const HYBRID_TERMS = ["hybrid"];
const ONSITE_TERMS = ["on-site", "onsite", "on site", "office-based"];

const GLOBAL_OFFICE_BLOCK = [
  "united states", "u.s.", "usa", ", us", "us-remote", "remote, us", "remote - us",
  "san francisco", "new york", "seattle", "nyc", "nyc-",
  "austin", "denver", "chicago", "los angeles", "boston", "california",
  "texas", "washington, dc", "portland", "miami", "atlanta",
  "london", "dublin", "berlin", "paris", "toronto", "vancouver",
  "amsterdam", "munich", "singapore", "sydney", "melbourne",
  "israel", "tel aviv", "karachi", "lahore", "islamabad", "amman",
  "india", "dubai", "abu dhabi", "uae", "united arab emirates",
];

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isSaudiFocused(profile: JobProfile): boolean {
  return (profile.countries || []).some((c) => /saudi|ksa/i.test(c));
}

function locationSaysRemote(locationText: string): boolean {
  const loc = locationText.toLowerCase();
  return REMOTE_TERMS.some((k) => loc.includes(k));
}

function detectSaudiMatch(locationText: string, descriptionText: string) {
  const loc = locationText.toLowerCase().trim();
  if (loc && SAUDI_CITIES.some((c) => loc.includes(c))) return true;
  if (!loc) {
    const desc = descriptionText.toLowerCase();
    return SAUDI_CITIES.some((c) => desc.includes(c));
  }
  return false;
}

function detectWorkType(locationText: string, descriptionText: string) {
  const loc = locationText.toLowerCase();
  const text = `${locationText} ${descriptionText}`.toLowerCase();
  if (locationSaysRemote(loc)) return "remote";
  if (REMOTE_TERMS.some((k) => text.includes(k)) && !HYBRID_TERMS.some((k) => loc.includes(k))) {
    return "remote";
  }
  if (HYBRID_TERMS.some((k) => loc.includes(k)) || HYBRID_TERMS.some((k) => text.includes(k))) {
    return "hybrid";
  }
  if (ONSITE_TERMS.some((k) => text.includes(k))) return "onsite";
  return "unknown";
}

function saudiPriority(job: NormalizedJob): number {
  const loc = (job.job_location || "").toLowerCase();
  if (detectSaudiMatch(loc, "")) return 0;
  if (locationSaysRemote(loc) && !GLOBAL_OFFICE_BLOCK.some((b) => loc.includes(b))) return 1;
  return 3;
}

export function filterAndDedupeJobs(
  jobs: NormalizedJob[],
  profile: JobProfile,
  existingIds: Set<string>
): NormalizedJob[] {
  const profileLocs = String(profile.targetLocations || "Remote,Riyadh,Jeddah,Dammam,Khobar")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const saudiFocused = isSaudiFocused(profile);
  const includeRemote = profile.includeRemote !== false;
  const includeHybrid = profile.includeHybrid !== false;
  const includeOnsite = profile.includeOnsite !== false;
  const maxAgeDays = profile.maxJobAgeDays || 7;
  const maxJobsPerRun = profile.maxJobsPerRun || 30;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);
  cutoff.setHours(0, 0, 0, 0);

  const out: NormalizedJob[] = [];

  for (const j of jobs) {
    if (!j.external_id || !j.job_title) continue;

    const title = j.job_title.toLowerCase();
    const loc = (j.job_location || "").toLowerCase();
    const desc = (j.description || "").toLowerCase();

    if (SENIOR_BLOCK.some((k) => title.includes(k))) continue;
    if (!TITLE_GROUPS.some((g) => g.some((k) => title.includes(k)))) continue;

    const posted = parseDate(j.date_posted);
    if (posted && posted < cutoff) continue;

    const saudiMatch = detectSaudiMatch(loc, desc);
    const locRemote = locationSaysRemote(loc);
    const profileLocMatch = profileLocs.some((t) => loc.includes(t) || desc.includes(t));

    if (saudiFocused) {
      if (saudiMatch) {
        // always allow Saudi-targeted roles
      } else if (includeRemote && locRemote) {
        if (GLOBAL_OFFICE_BLOCK.some((b) => loc.includes(b))) continue;
      } else if (profileLocMatch && locRemote) {
        if (GLOBAL_OFFICE_BLOCK.some((b) => loc.includes(b))) continue;
      } else {
        continue;
      }
    } else {
      const remoteInText =
        includeRemote && REMOTE_TERMS.some((t) => `${loc} ${desc}`.includes(t));
      if (!saudiMatch && !remoteInText && !profileLocMatch) continue;
      const blockedOnsite = GLOBAL_OFFICE_BLOCK.some((h) => loc.includes(h));
      if (blockedOnsite && !locRemote) continue;
    }

    const workType = detectWorkType(loc, desc);
    if (workType === "remote" && !includeRemote) continue;
    if (workType === "hybrid" && !includeHybrid) continue;
    if (workType === "onsite" && !includeOnsite) continue;
    if (existingIds.has(j.external_id)) continue;

    out.push({
      ...j,
      work_type: workType,
      date_posted: posted ? posted.toISOString() : j.date_posted,
    });
  }

  out.sort((a, b) => {
    const priorityDiff = saudiPriority(a) - saudiPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    const dateA = parseDate(a.date_posted)?.getTime() || 0;
    const dateB = parseDate(b.date_posted)?.getTime() || 0;
    return dateB - dateA;
  });

  return out.slice(0, maxJobsPerRun);
}
