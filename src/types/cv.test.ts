import { describe, it, expect } from "vitest";
import { CVDataSchema } from "./cv";

describe("CV Data Zod Schema Validation", () => {
  it("should validate a complete valid CV object", () => {
    const validCV = {
      personal: {
        fullName: "Anatoli Aliaksandrou",
        title: "Senior Fullstack Engineer",
        email: "test@example.com",
        phone: "+48 123 456 789",
        location: "Warsaw, Poland",
        summary: "6+ years experienced engineer.",
      },
      skills: ["TypeScript", "Next.js 15", "PostgreSQL"],
      experience: [
        {
          id: "exp-1",
          company: "Tech Solutions",
          role: "Lead Engineer",
          location: "Remote",
          startDate: "2023-01",
          current: true,
          description: "• Scaled API services to 10k RPS",
          technologies: ["Node.js", "PostgreSQL"],
        },
      ],
      education: [
        {
          id: "edu-1",
          institution: "University",
          degree: "B.Sc.",
          startDate: "2016",
        },
      ],
      projects: [],
      languages: [
        { language: "English", proficiency: "Fluent" },
      ],
      gdprConsent: {
        enabled: true,
        text: "I hereby consent to my personal data being processed for recruitment.",
      },
    };

    const parsed = CVDataSchema.safeParse(validCV);
    expect(parsed.success).toBe(true);
  });

  it("should fail validation when required personal info is missing", () => {
    const invalidCV = {
      personal: {
        fullName: "", // Required min 1
        email: "invalid-email-format", // Invalid email
        title: "",
      },
      skills: [],
      experience: [],
      education: [],
      projects: [],
      languages: [],
    };

    const parsed = CVDataSchema.safeParse(invalidCV);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.length).toBeGreaterThan(0);
    }
  });
});
