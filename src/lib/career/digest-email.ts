import nodemailer from "nodemailer";
import type { JobListing } from "@/types/career";

export async function sendJobDigestEmail(params: {
  to: string;
  jobs: JobListing[];
  appUrl: string;
  name?: string;
}): Promise<boolean> {
  const { to, jobs, appUrl, name } = params;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[digest] SMTP not configured — skipping");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const rows = jobs
    .map(
      (job) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee">
          <strong>${esc(job.title)}</strong><br/>
          <span style="color:#666">${esc(job.company)} · ${esc(job.location)}</span><br/>
          <span style="color:#2563eb">${job.matchScore}% match</span> ·
          <a href="${esc(job.applyUrl)}">Apply</a>
        </td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2>Almaram — وظائف جديدة لك</h2>
      <p>مرحباً ${esc(name || "")}، هذي آخر ${jobs.length} فرص تناسب مسمياتك:</p>
      <table style="width:100%;border-collapse:collapse">${rows}</table>
      <p style="margin-top:24px">
        <a href="${appUrl}/jobs" style="background:#1e293b;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none">
          افتح Almaram
        </a>
      </p>
    </div>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    subject:
      jobs.length > 0
        ? `Almaram: ${jobs.length} وظائف جديدة تناسبك`
        : "Almaram: لا توجد وظائف جديدة اليوم",
    html,
  });

  return true;
}
