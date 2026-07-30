import { listApplications } from "@/lib/applications-store";
import { getLastRun } from "@/lib/pipeline/run";
import type { ActivityItem, JobMatch } from "@/types";

function isRealPrepared(app: {
  status: string;
  tailoredResume: string;
  jobUrl: string;
  externalId: string;
}) {
  return (
    app.status === "prepared" &&
    app.tailoredResume.trim().length > 0 &&
    !app.externalId.startsWith("setup-test")
  );
}

export async function getDashboardData() {
  const applications = await listApplications();
  const lastRun = await getLastRun();

  const prepared = applications.filter(isRealPrepared);
  const errors = applications.filter((a) => a.status === "error");
  const skipped = lastRun?.skipped ?? 0;

  const topMatches: JobMatch[] = prepared
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6)
    .map((app) => ({
      id: app.id,
      company: app.company,
      companyLogo: app.company.charAt(0).toUpperCase(),
      title: app.role,
      matchScore: app.matchScore,
      location: app.jobLocation || "—",
      remote: /remote/i.test(app.jobLocation),
      jobUrl: app.jobUrl,
      status: app.status,
    }));

  const recentActivity: ActivityItem[] = applications
    .filter((a) => a.externalId !== "setup-test-001")
    .slice(0, 8)
    .map((app) => ({
      id: app.id,
      title:
        app.status === "prepared"
          ? `Ready: ${app.company}`
          : `Error: ${app.company}`,
      description: `${app.role} — score ${app.matchScore}`,
      timestamp: new Date(app.dateFound).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      type:
        app.status === "prepared"
          ? "match"
          : app.status === "error"
            ? "application"
            : "application",
      href: `/applications/${encodeURIComponent(app.id)}`,
    }));

  if (lastRun) {
    recentActivity.unshift({
      id: lastRun.runId,
      title: "Pipeline run completed",
      description: lastRun.message,
      timestamp: new Date(lastRun.finishedAt).toLocaleString("en-GB"),
      type: "automation",
      href: "/applications",
    });
  }

  return {
    stats: {
      prepared: prepared.length,
      skipped,
      errors: errors.length,
      total: applications.filter((a) => a.externalId !== "setup-test-001")
        .length,
    },
    lastRun,
    topMatches,
    recentActivity,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
  };
}
