import { describe, it, expect } from "vitest";
import { AIService } from "./index";

describe("AIService Heuristic & LLM Router", () => {
  const ai = new AIService("openai");

  it("should calculate ATS score and match relevant skills", async () => {
    const res = await ai.analyzeATS({
      cvText: "Experienced in Next.js 15, TypeScript, PostgreSQL, Docker, Tailwind CSS.",
      jobDescription: "Looking for a Next.js and TypeScript developer with PostgreSQL knowledge.",
    });

    expect(res.score).toBeGreaterThanOrEqual(70);
    expect(res.matchedSkills).toContain("Next.js");
    expect(res.matchedSkills).toContain("Typescript");
    expect(res.actionableSuggestions.length).toBeGreaterThan(0);
  });

  it("should generate structured cover letter with correct company and role", async () => {
    const res = await ai.generateCoverLetter({
      cvText: "Senior Fullstack Engineer.",
      jobTitle: "Senior Frontend Engineer",
      companyName: "Stripe",
      jobDescription: "Core payment UI platform.",
      tone: "professional",
    });

    expect(res.coverLetter).toContain("Stripe");
    expect(res.coverLetter).toContain("Senior Frontend Engineer");
  });
});
