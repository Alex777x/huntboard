import { z } from "zod";

export const ExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string(),
  technologies: z.array(z.string()).default([]),
});

export const EducationItemSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
});

export const ProjectItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Project title is required"),
  description: z.string(),
  link: z.string().url().optional().or(z.literal("")),
  technologies: z.array(z.string()).default([]),
});

export const LanguageItemSchema = z.object({
  language: z.string(),
  proficiency: z.enum(["Native", "Fluent", "Professional", "Intermediate", "Basic"]),
});

export const CVDataSchema = z.object({
  personal: z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    location: z.string().optional(),
    title: z.string().min(1, "Professional title is required"),
    summary: z.string().optional(),
    linkedinUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    portfolioUrl: z.string().optional(),
  }),
  skills: z.array(z.string()).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  education: z.array(EducationItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  languages: z.array(LanguageItemSchema).default([]),
});

export type CVData = z.infer<typeof CVDataSchema>;
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type ProjectItem = z.infer<typeof ProjectItemSchema>;
export type LanguageItem = z.infer<typeof LanguageItemSchema>;
