import type {
  ActivityItem,
  Application,
  AutomationSettings,
  DashboardStats,
  JobMatch,
  UserProfile,
} from "@/types";

export const dashboardStats: DashboardStats = {
  applications: 47,
  interviews: 8,
  pending: 12,
  rejected: 15,
};

export const recentActivity: ActivityItem[] = [
  {
    id: "1",
    title: "Applied to Stripe",
    description: "Senior Frontend Engineer — Resume v3",
    timestamp: "2 hours ago",
    type: "application",
  },
  {
    id: "2",
    title: "Interview scheduled",
    description: "Vercel — Product Engineer, Round 2",
    timestamp: "5 hours ago",
    type: "interview",
  },
  {
    id: "3",
    title: "New match found",
    description: "Linear — Staff Engineer (94% match)",
    timestamp: "Yesterday",
    type: "match",
  },
  {
    id: "4",
    title: "Automation completed",
    description: "12 applications submitted automatically",
    timestamp: "Yesterday",
    type: "automation",
  },
];

export const jobMatches: JobMatch[] = [
  {
    id: "1",
    company: "Linear",
    companyLogo: "L",
    title: "Staff Software Engineer",
    matchScore: 94,
    location: "San Francisco, US",
    remote: true,
  },
  {
    id: "2",
    company: "Notion",
    companyLogo: "N",
    title: "Senior Product Engineer",
    matchScore: 91,
    location: "New York, US",
    remote: true,
  },
  {
    id: "3",
    company: "Stripe",
    companyLogo: "S",
    title: "Frontend Engineer",
    matchScore: 88,
    location: "Dublin, IE",
    remote: false,
  },
  {
    id: "4",
    company: "Vercel",
    companyLogo: "V",
    title: "Developer Experience Engineer",
    matchScore: 86,
    location: "Remote",
    remote: true,
  },
];

export const applications: Application[] = [
  {
    id: "1",
    company: "Stripe",
    role: "Senior Frontend Engineer",
    matchScore: 92,
    resumeVersion: "v3",
    appliedDate: "Jul 18, 2026",
    status: "interview",
  },
  {
    id: "2",
    company: "Vercel",
    role: "Product Engineer",
    matchScore: 89,
    resumeVersion: "v3",
    appliedDate: "Jul 17, 2026",
    status: "pending",
  },
  {
    id: "3",
    company: "Figma",
    role: "Software Engineer",
    matchScore: 85,
    resumeVersion: "v2",
    appliedDate: "Jul 15, 2026",
    status: "applied",
  },
  {
    id: "4",
    company: "Airbnb",
    role: "Full Stack Engineer",
    matchScore: 78,
    resumeVersion: "v2",
    appliedDate: "Jul 12, 2026",
    status: "rejected",
  },
  {
    id: "5",
    company: "Shopify",
    role: "Senior Developer",
    matchScore: 91,
    resumeVersion: "v3",
    appliedDate: "Jul 10, 2026",
    status: "interview",
  },
  {
    id: "6",
    company: "Datadog",
    role: "Platform Engineer",
    matchScore: 83,
    resumeVersion: "v2",
    appliedDate: "Jul 8, 2026",
    status: "applied",
  },
];

export const defaultAutomationSettings: AutomationSettings = {
  jobTitles: ["Software Engineer", "AI Engineer", "Backend Engineer"],
  countries: ["Saudi Arabia", "Remote"],
  minMatchScore: 70,
  remoteOnly: true,
  autoGenerateResume: true,
  generateCoverLetter: true,
  autoApply: false,
};

export const defaultProfile: UserProfile = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  portfolio: "",
  resumeText: "",
  jobTitles: ["Software Engineer", "AI Engineer", "Backend Engineer"],
  countries: ["Saudi Arabia", "Remote"],
  remote: true,
  minSalary: 0,
  yearsExperience: 0,
  skills: [],
  projects: [],
  education: [],
  experience: [],
};

export const countryOptions = [
  "Saudi Arabia",
  "Remote",
  "United Arab Emirates",
  "United States",
  "United Kingdom",
  "Germany",
  "Netherlands",
  "Canada",
];

export const suggestedSkills = [
  "Swift",
  "Python",
  "React",
  "Machine Learning",
  "SQL",
  "Docker",
  "TypeScript",
  "Node.js",
  "AWS",
  "Kubernetes",
  "GraphQL",
  "Go",
];
