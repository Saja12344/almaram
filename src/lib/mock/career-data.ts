import type { JobListing, ResumeAnalysis } from "@/types/career";

export const DEMO_ANALYSIS: ResumeAnalysis = {
  name: "Saja Alhomrany",
  yearsExperience: 3,
  education: ["B.S. Information Technology — Al-Baha University"],
  skills: ["Swift", "React", "TypeScript", "REST APIs", "Firebase", "OpenAI API"],
  projects: ["Sensic (App Store)", "Glutinc OCR App", "Abjad Kindergarten Platform"],
  certificates: ["Apple Developer Academy", "Apple Foundation Program"],
  programmingLanguages: ["Swift", "JavaScript", "TypeScript", "Dart", "SQL"],
  frameworks: ["SwiftUI", "React", "Node.js", "Tailwind CSS", "Flutter"],
  softSkills: ["Problem Solving", "Agile", "Communication", "Design Thinking"],
  rawText: "Demo resume content for Almaram preview.",
};

export const DEFAULT_JOB_TITLES = [
  "AI Engineer",
  "Software Engineer",
  "Backend Engineer",
  "iOS Developer",
  "Machine Learning Engineer",
];

export const MOCK_JOBS: JobListing[] = [
  {
    id: "tamara-flutter-riyadh",
    company: "Tamara",
    companyLogo: "T",
    title: "Product Engineer II — Flutter",
    location: "Riyadh, Saudi Arabia",
    remote: false,
    employmentType: "hybrid",
    matchScore: 91,
    salary: "SAR 18,000 – 24,000",
    postedDate: "2026-07-28",
    applyUrl: "https://jobs.example.com/tamara",
    source: "Greenhouse",
    description:
      "Build mobile experiences for millions of users across the Gulf. Work with Flutter and modern backend APIs in a fast-growing fintech team.",
    responsibilities: [
      "Ship production Flutter features with high quality",
      "Collaborate with design and product on user flows",
      "Integrate REST APIs and payment experiences",
    ],
    requirements: [
      "2+ years mobile development",
      "Flutter or strong iOS background",
      "Experience with REST APIs",
    ],
    requiredSkills: ["Flutter", "Dart", "REST API", "Mobile", "Git"],
    matchedSkills: ["Swift", "Dart", "REST APIs", "Mobile", "Git"],
    missingSkills: ["Flutter production at scale"],
    scoreReason:
      "Strong mobile foundation with Swift/Dart overlap and published App Store apps. Flutter-specific production depth is the main gap.",
    aiRecommendation:
      "Excellent fit for a mobile engineer transitioning to Flutter. Highlight Sensic and API integration work.",
  },
  {
    id: "neom-ios",
    company: "NEOM",
    companyLogo: "N",
    title: "iOS Software Engineer",
    location: "NEOM, Saudi Arabia",
    remote: false,
    employmentType: "onsite",
    matchScore: 88,
    salary: "Competitive",
    postedDate: "2026-07-27",
    applyUrl: "https://jobs.example.com/neom",
    source: "Career Page",
    description:
      "Join NEOM's digital products team to build iOS applications that support next-generation city experiences.",
    responsibilities: [
      "Develop SwiftUI features for internal and public apps",
      "Ensure accessibility and performance standards",
      "Partner with cross-functional teams",
    ],
    requirements: [
      "Swift & SwiftUI experience",
      "Published apps or strong portfolio",
      "Understanding of MVVM patterns",
    ],
    requiredSkills: ["Swift", "SwiftUI", "iOS", "MVVM", "Accessibility"],
    matchedSkills: ["Swift", "SwiftUI", "iOS", "MVVM", "Accessibility"],
    missingSkills: ["Large-scale enterprise iOS"],
    scoreReason:
      "Direct alignment with your Apple Developer Academy work and published Sensic app.",
    aiRecommendation:
      "Top match. Lead with App Store publication and accessibility-focused projects.",
  },
  {
    id: "careem-remote",
    company: "Careem",
    companyLogo: "C",
    title: "Software Engineer — Mobile",
    location: "Remote · GCC",
    remote: true,
    employmentType: "remote",
    matchScore: 84,
    postedDate: "2026-07-26",
    applyUrl: "https://jobs.example.com/careem",
    source: "Greenhouse",
    description:
      "Careem is hiring mobile engineers to improve ride and delivery experiences across the Middle East.",
    responsibilities: [
      "Build and maintain mobile features",
      "Write clean, tested code",
      "Participate in code reviews",
    ],
    requirements: [
      "Mobile development experience",
      "Strong CS fundamentals",
      "Team collaboration skills",
    ],
    requiredSkills: ["Mobile", "Swift", "Kotlin", "APIs"],
    matchedSkills: ["Mobile", "Swift", "APIs"],
    missingSkills: ["Kotlin", "Large team mobile at scale"],
    scoreReason: "Solid mobile profile with GCC-friendly remote option.",
    aiRecommendation: "Good match if you emphasize cross-platform learning ability.",
  },
  {
    id: "stc-ai",
    company: "stc",
    companyLogo: "S",
    title: "AI Engineer",
    location: "Riyadh, Saudi Arabia",
    remote: false,
    employmentType: "hybrid",
    matchScore: 79,
    salary: "SAR 20,000+",
    postedDate: "2026-07-25",
    applyUrl: "https://jobs.example.com/stc",
    source: "Saudi Career Page",
    description:
      "Work on AI-powered products and integrations for stc's digital services portfolio.",
    responsibilities: [
      "Integrate LLM APIs into product workflows",
      "Prototype AI features with engineering teams",
      "Document and test AI integrations",
    ],
    requirements: [
      "Python or TypeScript",
      "LLM API experience",
      "Software engineering fundamentals",
    ],
    requiredSkills: ["Python", "LLM", "APIs", "TypeScript"],
    matchedSkills: ["OpenAI API", "TypeScript", "APIs"],
    missingSkills: ["Python production", "ML pipelines"],
    scoreReason: "AI integration experience matches; deepen Python for stronger fit.",
    aiRecommendation: "Highlight OpenAI API integration and AI-assisted development.",
  },
  {
    id: "linear-remote",
    company: "Linear",
    companyLogo: "L",
    title: "Product Engineer",
    location: "Remote Worldwide",
    remote: true,
    employmentType: "remote",
    matchScore: 72,
    postedDate: "2026-07-24",
    applyUrl: "https://jobs.example.com/linear",
    source: "Ashby",
    description:
      "Linear is looking for product engineers who care deeply about craft and user experience.",
    responsibilities: [
      "Build polished frontend features",
      "Collaborate with design",
      "Improve product quality",
    ],
    requirements: ["React", "TypeScript", "Product sense"],
    requiredSkills: ["React", "TypeScript", "CSS"],
    matchedSkills: ["React", "TypeScript"],
    missingSkills: ["Large-scale web product"],
    scoreReason: "Web stack overlap; less senior product scope than ideal.",
    aiRecommendation: "Consider if global remote is a priority over Gulf-focused roles.",
  },
];

export const COUNTRY_OPTIONS = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Bahrain",
  "Kuwait",
  "Oman",
  "Remote Worldwide",
];

export const CITY_OPTIONS = [
  "Riyadh",
  "Jeddah",
  "Dammam",
  "Khobar",
  "Makkah",
  "Madinah",
  "Tabuk",
  "NEOM",
];

export function getJobById(id: string) {
  return MOCK_JOBS.find((j) => j.id === id);
}

export function getSortedJobs() {
  return [...MOCK_JOBS].sort((a, b) => b.matchScore - a.matchScore);
}
