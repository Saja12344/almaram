const sources = $("Build Public Board Sources").all();
const responses = $input.all();
const out = [];

function strip(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

for (let i = 0; i < responses.length; i++) {
  const src = (sources[i] && sources[i].json) || {};
  const body = responses[i].json || {};
  const board = src.board;
  const company = src.company || "";
  let list = [];

  if (board === "greenhouse") list = Array.isArray(body.jobs) ? body.jobs : [];
  else if (board === "lever") list = Array.isArray(body) ? body : [];
  else if (board === "ashby") list = Array.isArray(body.jobs) ? body.jobs : [];

  for (const j of list) {
    let title = "", loc = "", url = "", desc = "", ext = "", datePosted = null;

    if (board === "greenhouse") {
      title = j.title || "";
      loc = (j.location && j.location.name) || "";
      url = j.absolute_url || "";
      desc = strip(j.content);
      ext = "greenhouse-" + company + "-" + j.id;
      datePosted = j.updated_at || j.first_published || null;
    } else if (board === "lever") {
      title = j.text || "";
      loc = (j.categories && j.categories.location) || "";
      url = j.hostedUrl || "";
      desc = strip(j.descriptionPlain || j.description);
      ext = "lever-" + company + "-" + j.id;
      datePosted = j.createdAt || null;
    } else if (board === "ashby") {
      title = j.title || "";
      loc = j.location || "";
      url = j.jobUrl || j.applyUrl || "";
      desc = strip(j.descriptionPlain || j.description);
      ext = "ashby-" + company + "-" + (j.id || j.jobId);
      datePosted = j.publishedAt || null;
    }

    out.push({
      json: {
        external_id: ext,
        company,
        job_title: title,
        job_location: loc,
        job_url: url,
        source: board,
        description: (desc || "").slice(0, 6000),
        date_posted: datePosted
      }
    });
  }
}

return out;
