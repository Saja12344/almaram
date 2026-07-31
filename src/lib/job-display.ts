import type { JobListing } from "@/types/career";
import type { Locale } from "@/lib/i18n";

/** Primary title for UI — localized when available, original preserved for apply flows. */
export function getJobTitle(job: JobListing, locale: Locale): string {
  if (locale === "ar" && job.titleLocalized) return job.titleLocalized;
  return job.title;
}

/** Original posting title (usually English) — shown as secondary line in Arabic UI. */
export function getJobOriginalTitle(job: JobListing): string {
  return job.title;
}

export function showOriginalTitleSubtitle(job: JobListing, locale: Locale): boolean {
  return locale === "ar" && Boolean(job.titleLocalized) && job.titleLocalized !== job.title;
}
