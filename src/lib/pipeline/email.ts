import nodemailer from "nodemailer";
import type { PipelineRunResult } from "./types";

export async function sendPipelineUpdateEmail(params: {
  to: string;
  result: PipelineRunResult;
  appUrl: string;
}): Promise<boolean> {
  const { to, result, appUrl } = params;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[email] SMTP not configured — skipping notification");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  const subject =
    result.prepared > 0
      ? `JobPilot: ${result.prepared} وظيفة جديدة جاهزة — شيك الموقع`
      : `JobPilot: تحديث يومي — ${result.processed} وظيفة تم فحصها`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2>JobPilot — تحديث جديد على الموقع</h2>
      <p>Run: ${result.runId}</p>
      ${
        result.prepared > 0
          ? `<p>عندك <strong>${result.prepared}</strong> وظيفة جاهزة. السيرة والكفر لتر PDF على الموقع.</p>`
          : `<p>ما في وظائف جديدة جاهزة اليوم.</p>`
      }
      <p><a href="${appUrl}/applications" style="background:#2563eb;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none">افتح Applications</a></p>
      <ul>
        <li>Processed: ${result.processed}</li>
        <li>Prepared: ${result.prepared}</li>
        <li>Skipped: ${result.skipped}</li>
        <li>Errors: ${result.errors}</li>
      </ul>
    </div>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    subject,
    html,
  });

  return true;
}
