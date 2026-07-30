const LF = String.fromCharCode(10);
const rows = $input.all().map(i => i.json).filter(r => r && Object.keys(r).length > 0 && r.external_id);
const prepared = rows.filter(r => r.status === "prepared");
const lowScore = rows.filter(r => r.status === "skipped_low_score");
const errors = rows.filter(r => r.status === "error");
const profile = $("Get Profile").first().json || {};
const appUrl = String(profile.site_url || "http://localhost:3000").replace(/\/$/, "");

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const html = [
  "<div style=\"font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px\">",
  "<h2 style=\"margin:0 0 8px\">JobPilot — تحديث جديد على الموقع</h2>",
  "<p style=\"color:#555;margin:0 0 16px\">Run: " + esc($execution.id) + "</p>",
  prepared.length
    ? "<p style=\"font-size:16px;line-height:1.6\">عندك <strong>" + prepared.length + "</strong> وظيفة جاهزة للمراجعة. السيرة والكفر لتر PDF موجودين في الموقع.</p>"
    : "<p style=\"font-size:16px;line-height:1.6\">ما في وظائف جديدة جاهزة اليوم. راجع الموقع للتفاصيل.</p>",
  "<p style=\"margin:20px 0\"><a href=\"" + esc(appUrl + "/applications") + "\" style=\"display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600\">افتح Applications في JobPilot</a></p>",
  "<ul style=\"color:#444;line-height:1.8;padding-left:18px\">",
  "<li>Matching new jobs processed: " + rows.length + "</li>",
  "<li>Prepared (PDF ready on site): " + prepared.length + "</li>",
  "<li>Skipped (below threshold): " + lowScore.length + "</li>",
  "<li>Errors: " + errors.length + "</li>",
  "</ul>",
  "<p style=\"color:#888;font-size:12px;margin-top:20px\">التفاصيل الكاملة والملفات على الموقع — الإيميل للتنبيه فقط.</p>",
  "</div>"
].join(LF);

const subject = prepared.length
  ? "JobPilot: " + prepared.length + " وظيفة جديدة جاهزة — شيك الموقع"
  : "JobPilot: تحديث يومي — " + rows.length + " وظيفة تم فحصها";

return [{ json: { subject, html, prepared: prepared.length, processed: rows.length, appUrl } }];
