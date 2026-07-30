const out = [];

for (const item of $input.all()) {
  const body = item.json || {};
  const list = Array.isArray(body.results) ? body.results : [];

  for (const j of list) {
    out.push({
      json: {
        external_id: "adzuna-" + j.id,
        company: (j.company && j.company.display_name) || "",
        job_title: j.title || "",
        job_location: (j.location && j.location.display_name) || "",
        job_url: j.redirect_url || "",
        source: "adzuna",
        description: String(j.description || "").slice(0, 6000),
        date_posted: j.created || null
      }
    });
  }
}

return out;
