// Adzuna Saudi Arabia (country code: sa) + multiple title searches
const queries = [
  "software engineer",
  "AI engineer",
  "machine learning engineer",
  "backend engineer",
  "full stack engineer",
  "python developer",
  "LLM engineer",
  "prompt engineer",
  "mobile developer",
  "ios developer"
];
const out = [];
for (const what of queries) {
  out.push({ json: {
    board: "adzuna",
    query: what,
    url: "https://api.adzuna.com/v1/api/jobs/sa/search/1?results_per_page=50&what=" + encodeURIComponent(what) + "&content-type=application/json"
  }});
}
return out;