import { CVData } from "@/types/cv";

export const defaultCVData: CVData = {
  personal: {
    fullName: "Anatoli Liaksandrou",
    title: "Senior Fullstack Engineer",
    email: "anatoli@example.com",
    phone: "+48 500 123 456",
    location: "Warsaw, Poland (Open to Remote)",
    summary:
      "Passionate Software Engineer with 6+ years of experience building high-performance web applications, distributed backend services, and AI-driven workflows using Next.js 15, TypeScript, React 19, and PostgreSQL.",
    linkedinUrl: "https://linkedin.com/in/example",
    githubUrl: "https://github.com/example",
    portfolioUrl: "https://example.com",
  },
  skills: [
    "TypeScript",
    "JavaScript (ESNext)",
    "React 19",
    "Next.js 15 (App Router)",
    "Node.js",
    "PostgreSQL",
    "Supabase",
    "Tailwind CSS v4",
    "Zustand",
    "TanStack Query",
    "REST & GraphQL APIs",
    "Docker",
    "Git",
    "Vitest",
    "Playwright",
  ],
  experience: [
    {
      id: "exp-1",
      company: "TechPulse Solutions",
      role: "Senior Fullstack Engineer",
      location: "Warsaw / Remote",
      startDate: "2023-01",
      endDate: "Present",
      current: true,
      description:
        "• Architected and migrated legacy monolith into Next.js 15 App Router with server-side rendering, reducing LCP by 45%.\n• Designed scalable PostgreSQL database schema with Row Level Security (RLS) and real-time subscription channels.\n• Integrated OpenAI & Claude AI models for automated resume parsing and intelligent matchmaking.",
      technologies: ["Next.js 15", "TypeScript", "PostgreSQL", "Supabase", "Tailwind CSS"],
    },
    {
      id: "exp-2",
      company: "Innovate Labs",
      role: "Frontend Engineer",
      location: "Remote",
      startDate: "2020-06",
      endDate: "2022-12",
      current: false,
      description:
        "• Developed reusable UI component library on Tailwind and Radix UI with 98% unit test coverage in Vitest.\n• Built real-time drag-and-drop analytics dashboard using dnd-kit and WebSocket streams.\n• Optimized bundle size by 35% through tree-shaking and dynamic code splitting.",
      technologies: ["React", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Vitest"],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Warsaw University of Technology",
      degree: "B.Sc. in Computer Science",
      fieldOfStudy: "Software Engineering & Distributed Systems",
      startDate: "2016-09",
      endDate: "2020-06",
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "HuntBoard — AI Job Search Platform",
      description:
        "Two-sided career management platform with ATS scoring, real-time Kanban pipelines, and BYO AI key encryption.",
      link: "https://huntboard.io",
      technologies: ["Next.js 15", "Supabase", "Tailwind v4", "TypeScript"],
    },
  ],
  languages: [
    { language: "English", proficiency: "Fluent" },
    { language: "Russian", proficiency: "Native" },
    { language: "Polish", proficiency: "Professional" },
  ],
};
