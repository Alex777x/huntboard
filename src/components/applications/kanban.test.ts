import { describe, it, expect } from "vitest";
import { arrayMove } from "@dnd-kit/sortable";
import { Application, ApplicationStatus } from "@/types/database";

describe("Kanban Drag and Drop Logic", () => {
  const sampleApps: Application[] = [
    {
      id: "app-1",
      profile_id: "u-1",
      company_id: "Stripe",
      cv_id: null,
      recruiter_job_id: null,
      job_title: "Senior Fullstack Engineer",
      job_url: null,
      job_description: null,
      status: "wishlist",
      custom_status_id: null,
      source: "linkedin",
      work_format: "remote",
      job_location: "Remote",
      salary_min: 150000,
      salary_max: 180000,
      salary_currency: "USD",
      priority: 5,
      notes: null,
      cover_letter: null,
      applied_at: null,
      next_interview_at: null,
      deadline_at: null,
      ats_score: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "app-2",
      profile_id: "u-1",
      company_id: "Linear",
      cv_id: null,
      recruiter_job_id: null,
      job_title: "Product Engineer",
      job_url: null,
      job_description: null,
      status: "interview",
      custom_status_id: null,
      source: "referral",
      work_format: "remote",
      job_location: "Remote",
      salary_min: 160000,
      salary_max: 190000,
      salary_currency: "USD",
      priority: 5,
      notes: null,
      cover_letter: null,
      applied_at: null,
      next_interview_at: null,
      deadline_at: null,
      ats_score: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  it("should move application from wishlist to interview column", () => {
    const updated = sampleApps.map((a) =>
      a.id === "app-1" ? { ...a, status: "interview" as ApplicationStatus } : a
    );

    const app1 = updated.find((a) => a.id === "app-1");
    expect(app1?.status).toBe("interview");
  });

  it("should reorder applications within the same column using arrayMove", () => {
    const list = ["app-1", "app-2", "app-3"];
    const reordered = arrayMove(list, 0, 2);
    expect(reordered).toEqual(["app-2", "app-3", "app-1"]);
  });
});
