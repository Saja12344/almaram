/**
 * Shared job pipeline utilities for n8n Code nodes.
 * Copy the needed functions into n8n Code nodes, or require this file if using n8n with external modules.
 */

const SAUDI_CITIES = [
  'riyadh', 'jeddah', 'dammam', 'khobar', 'al khobar', 'dhahran',
  'makkah', 'madinah', 'neom', 'tabuk', 'saudi arabia', 'ksa',
  'الرياض', 'جدة', 'الدمام', 'الخبر', 'الظهران'
];

const REMOTE_KEYWORDS = ['remote', 'work from home', 'wfh', 'anywhere', 'distributed'];
const HYBRID_KEYWORDS = ['hybrid'];
const ONSITE_KEYWORDS = ['on-site', 'onsite', 'on site', 'office-based'];

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildJobId(job) {
  const key = [job.company, job.title, job.location, job.applyUrl].join('|');
  return slugify(key).slice(0, 120);
}

function detectWorkType(locationText, descriptionText = '') {
  const text = `${locationText} ${descriptionText}`.toLowerCase();
  if (REMOTE_KEYWORDS.some((k) => text.includes(k))) return 'remote';
  if (HYBRID_KEYWORDS.some((k) => text.includes(k))) return 'hybrid';
  if (ONSITE_KEYWORDS.some((k) => text.includes(k))) return 'onsite';
  return 'unknown';
}

function isSaudiLocation(locationText) {
  const text = String(locationText || '').toLowerCase();
  return SAUDI_CITIES.some((city) => text.includes(city));
}

function isRemoteLocation(locationText) {
  const text = String(locationText || '').toLowerCase();
  return REMOTE_KEYWORDS.some((k) => text.includes(k));
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isWithinDays(dateValue, maxDays) {
  const posted = parseDate(dateValue);
  if (!posted) return true;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxDays);
  return posted >= cutoff;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeJob(raw, source) {
  const title = raw.title || raw.text || raw.position || 'Unknown Title';
  const company = raw.company || raw.company_name || raw.organization || 'Unknown Company';
  const location = raw.location || raw.location_name || raw.city || raw.country || 'Unknown';
  const description = stripHtml(raw.description || raw.content || raw.summary || '');
  const applyUrl = raw.applyUrl || raw.url || raw.absolute_url || raw.link || raw.hostedUrl || '';
  const salary = raw.salary || raw.salary_range || raw.compensation || null;
  const datePosted = raw.datePosted || raw.created_at || raw.posted_at || raw.updated_at || raw.pubDate || null;

  const job = {
    id: buildJobId({ company, title, location, applyUrl }),
    title: String(title).trim(),
    company: String(company).trim(),
    location: String(location).trim(),
    salary: salary ? String(salary).trim() : null,
    description,
    applyUrl: String(applyUrl).trim(),
    source: source || raw.source || 'unknown',
    datePosted: datePosted ? new Date(datePosted).toISOString() : null,
    workType: detectWorkType(location, description),
    isSaudi: isSaudiLocation(location),
    isRemote: isRemoteLocation(location),
    fetchedAt: new Date().toISOString(),
    rawSourceId: raw.id || raw.external_id || null,
  };

  return job;
}

function normalizeAdzunaJob(item) {
  return normalizeJob(
    {
      title: item.title,
      company: item.company?.display_name,
      location: item.location?.display_name,
      description: item.description,
      applyUrl: item.redirect_url,
      salary: item.salary_min && item.salary_max
        ? `${item.salary_min} - ${item.salary_max} ${item.salary_currency || 'SAR'}`
        : null,
      datePosted: item.created,
      id: item.id,
    },
    'adzuna'
  );
}

function normalizeGreenhouseJob(item, board) {
  return normalizeJob(
    {
      title: item.title,
      company: board,
      location: item.location?.name,
      description: item.content,
      applyUrl: item.absolute_url,
      datePosted: item.updated_at,
      id: item.id,
    },
    'greenhouse'
  );
}

function normalizeLeverJob(item, company) {
  return normalizeJob(
    {
      title: item.text,
      company,
      location: item.categories?.location,
      description: item.descriptionPlain || item.description,
      applyUrl: item.hostedUrl || item.applyUrl,
      datePosted: item.createdAt,
      id: item.id,
    },
    'lever'
  );
}

function normalizeAshbyJob(item, board) {
  return normalizeJob(
    {
      title: item.title,
      company: board,
      location: item.location,
      description: item.descriptionHtml,
      applyUrl: item.jobUrl,
      datePosted: item.publishedAt,
      id: item.id,
    },
    'ashby'
  );
}

function normalizeRssJob(item, feedName) {
  return normalizeJob(
    {
      title: item.title,
      company: item.creator || item.author || feedName,
      location: item['location'] || item['geo:lat'] || 'Remote',
      description: item.content || item.contentSnippet || item.summary,
      applyUrl: item.link,
      datePosted: item.pubDate || item.isoDate,
      id: item.guid || item.link,
    },
    `rss:${feedName}`
  );
}

function dedupeJobs(jobs, existingIds = new Set()) {
  const seen = new Set();
  const unique = [];

  for (const job of jobs) {
    const fingerprint = job.id || buildJobId(job);
    if (seen.has(fingerprint) || existingIds.has(fingerprint)) continue;
    seen.add(fingerprint);
    unique.push({ ...job, id: fingerprint });
  }

  return unique;
}

function filterJobs(jobs, preferences) {
  const maxAge = preferences.scheduling?.maxJobAgeDays ?? 7;
  const titles = (preferences.jobTitles || []).map((t) => t.toLowerCase());
  const cities = (preferences.region?.preferredCities || []).map((c) => c.toLowerCase());
  const includeRemote = preferences.region?.includeRemoteWorldwide !== false;
  const includeHybrid = preferences.region?.includeHybrid !== false;
  const includeOnSite = preferences.region?.includeOnSite !== false;

  return jobs.filter((job) => {
    if (!isWithinDays(job.datePosted, maxAge)) return false;

    const titleMatch = titles.length === 0 || titles.some((t) => job.title.toLowerCase().includes(t));
    if (!titleMatch) return false;

    const loc = job.location.toLowerCase();
    const saudiMatch = job.isSaudi || cities.some((c) => loc.includes(c));
    const remoteMatch = includeRemote && job.isRemote;
    if (!saudiMatch && !remoteMatch) return false;

    if (job.workType === 'remote' && !includeRemote) return false;
    if (job.workType === 'hybrid' && !includeHybrid) return false;
    if (job.workType === 'onsite' && !includeOnSite) return false;

    return true;
  });
}

function sortByMatchScore(jobs) {
  return [...jobs].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

module.exports = {
  SAUDI_CITIES,
  buildJobId,
  detectWorkType,
  isSaudiLocation,
  isRemoteLocation,
  normalizeJob,
  normalizeAdzunaJob,
  normalizeGreenhouseJob,
  normalizeLeverJob,
  normalizeAshbyJob,
  normalizeRssJob,
  dedupeJobs,
  filterJobs,
  sortByMatchScore,
  stripHtml,
};
