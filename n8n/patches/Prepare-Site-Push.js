const profile = $("Get Profile").first().json || {};
const job = $("Loop Over Jobs").item.json || {};
const kit = $("Build Application Kit").item.json || {};

return {
  json: {
    siteUrl: String(profile.site_url || "http://localhost:3000").replace(/\/$/, ""),
    secret: profile.ingest_secret || "",
    payload: {
      external_id: job.external_id,
      company: job.company,
      job_title: job.job_title,
      job_location: job.job_location || "",
      job_url: job.job_url || "",
      source: job.source || "",
      match_score: $("Code Match Score").item.json.output.match_score,
      resume_version: `tailored-${$now.toFormat("yyyyLLdd")}`,
      tailored_resume: $("Tailor Resume").item.json.text,
      cover_letter: $("Write Cover Letter").item.json.text,
      date_found: $now.toISO(),
      run_id: $execution.id,
      notes: kit.notes || ""
    }
  }
};
