import { z } from "zod";

export const ExperienceProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

export const ExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company name is required"),
  companyDescription: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string(), // raw bullet text or main summary
  projects: z.array(ExperienceProjectSchema).optional().default([]),
  technologies: z.array(z.string()).default([]),
});

export const EducationItemSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  details: z.string().optional(),
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
  proficiency: z.string(), // e.g. "Native", "Intermediate (B1)", "Upper-Intermediate (B2)"
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
  gdprConsent: z
    .object({
      enabled: z.boolean().default(false),
      text: z
        .string()
        .default(
          "I hereby consent to my personal data being processed for the purpose of current and future recruitment processes."
        ),
    })
    .optional(),
});

export type CVData = z.infer<typeof CVDataSchema>;
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type ExperienceProject = z.infer<typeof ExperienceProjectSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type ProjectItem = z.infer<typeof ProjectItemSchema>;
export type LanguageItem = z.infer<typeof LanguageItemSchema>;

export interface CVVersion {
  id: string;
  name: string;
  targetRole?: string;
  targetCompany?: string;
  updatedAt: string;
  isDefault?: boolean;
  data: CVData;
}
