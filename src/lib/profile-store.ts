import fs from "fs/promises";
import path from "path";
import type { AutomationSettings, JobProfile } from "@/types";
import { defaultProfile, defaultAutomationSettings } from "@/lib/mock-data";

const PROFILE_PATH = path.join(process.cwd(), "data", "profile.json");

const SAUDI_CITY_MAP: Record<string, string> = {
  "Saudi Arabia": "Riyadh,Jeddah,Dammam,Khobar",
  Remote: "Remote",
};

export function buildTargetLocations(countries: string[], remote: boolean): string {
  const parts = new Set<string>();
  if (remote) parts.add("Remote");
  for (const country of countries) {
    if (SAUDI_CITY_MAP[country]) {
      SAUDI_CITY_MAP[country].split(",").forEach((c) => parts.add(c.trim()));
    } else {
      parts.add(country);
    }
  }
  if (parts.size === 0) {
    parts.add("Remote");
    parts.add("Riyadh");
    parts.add("Jeddah");
  }
  return Array.from(parts).join(",");
}

export function mergeJobProfile(
  profile: Partial<JobProfile>,
  automation?: Partial<AutomationSettings>
): JobProfile {
  const base = { ...defaultProfile, ...profile };
  const auto = { ...defaultAutomationSettings, ...automation };

  const remoteOnly = profile.remote ?? auto.remoteOnly ?? base.remote;
  const saudiFocused = (profile.countries ?? base.countries).some((c) =>
    /saudi|ksa/i.test(c)
  );

  return {
    ...base,
    targetLocations:
      profile.targetLocations ||
      buildTargetLocations(base.countries, base.remote),
    targetTitles: profile.targetTitles || base.jobTitles.join(","),
    matchThreshold: profile.matchThreshold ?? auto.minMatchScore ?? 70,
    maxJobAgeDays: profile.maxJobAgeDays ?? 7,
    maxJobsPerRun: profile.maxJobsPerRun ?? 30,
    includeRemote: profile.includeRemote ?? remoteOnly,
    includeHybrid:
      profile.includeHybrid ?? (remoteOnly || saudiFocused ? false : true),
    includeOnsite:
      profile.includeOnsite ?? (remoteOnly || saudiFocused ? false : true),
    autoGenerateResume: profile.autoGenerateResume ?? auto.autoGenerateResume,
    generateCoverLetter:
      profile.generateCoverLetter ?? auto.generateCoverLetter,
  };
}

export async function getJobProfile(): Promise<JobProfile> {
  try {
    const raw = await fs.readFile(PROFILE_PATH, "utf8");
    const saved = JSON.parse(raw) as Partial<JobProfile>;
    return mergeJobProfile(saved);
  } catch {
    return mergeJobProfile({});
  }
}

export async function saveJobProfile(input: Partial<JobProfile>): Promise<JobProfile> {
  const current = await getJobProfile();
  const merged = mergeJobProfile({ ...current, ...input });
  await fs.mkdir(path.dirname(PROFILE_PATH), { recursive: true });
  await fs.writeFile(PROFILE_PATH, JSON.stringify(merged, null, 2), "utf8");
  return merged;
}

export async function saveAutomationToProfile(
  settings: AutomationSettings
): Promise<JobProfile> {
  const current = await getJobProfile();
  return saveJobProfile({
    ...current,
    jobTitles: settings.jobTitles,
    countries: settings.countries,
    remote: settings.remoteOnly,
    matchThreshold: settings.minMatchScore,
    autoGenerateResume: settings.autoGenerateResume,
    generateCoverLetter: settings.generateCoverLetter,
    targetLocations: buildTargetLocations(
      settings.countries,
      settings.remoteOnly
    ),
  });
}

export async function getAutomationFromProfile(): Promise<AutomationSettings> {
  const p = await getJobProfile();
  return {
    jobTitles: p.jobTitles,
    countries: p.countries,
    minMatchScore: p.matchThreshold,
    remoteOnly: p.includeRemote,
    autoGenerateResume: p.autoGenerateResume,
    generateCoverLetter: p.generateCoverLetter,
    autoApply: false,
  };
}
