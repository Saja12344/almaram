// Public ATS boards — Saudi Arabia + global remote-friendly companies
const greenhouse = ["neom", "careem", "hungerstation", "tamara", "stripe", "gitlab", "cloudflare", "anthropic", "linear", "figma", "vercel"];
const lever = ["noon", "canva"];
const ashby = ["openai", "ramp", "deel"];
const out = [];
for (const s of greenhouse) {
  out.push({ json: { board: "greenhouse", company: s, url: "https://boards-api.greenhouse.io/v1/boards/" + s + "/jobs?content=true" } });
}
for (const s of lever) {
  out.push({ json: { board: "lever", company: s, url: "https://api.lever.co/v0/postings/" + s + "?mode=json" } });
}
for (const s of ashby) {
  out.push({ json: { board: "ashby", company: s, url: "https://api.ashbyhq.com/posting-api/job-board/" + s } });
}
return out;