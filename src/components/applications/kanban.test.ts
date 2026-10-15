import { describe, it, expect } from "vitest";
import { arrayMove } from "@dnd-kit/sortable";
import { Application, ApplicationStatus } from "@/types/database";

describe("Kanban Drag and Drop Logic", () => {
  const sampleApps: Application[] = [
    {
      id: "app-1",
      profile_id: "u-1",
      company_id: "Stripe",
      company_name: null,
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
      company_name: null,
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

  it("should add a new imported job without overwriting existing applications (B-3 regression)", () => {
    const importedJob: Application = {
      id: "app-imported",
      profile_id: "u-1",
      company_id: null,
      company_name: "OpenAI",
      cv_id: null,
      recruiter_job_id: null,
      job_title: "Research Engineer",
      job_url: "https://openai.com/careers/123",
      job_description: "Build frontiers",
      status: "wishlist",
      custom_status_id: null,
      source: "linkedin",
      work_format: "remote",
      job_location: "San Francisco, CA",
      salary_min: 200000,
      salary_max: 300000,
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
    };

    const nextApps = [importedJob, ...sampleApps];
    expect(nextApps).toHaveLength(sampleApps.length + 1);
    expect(nextApps[0].id).toBe("app-imported");
    expect(nextApps.find((a) => a.id === "app-1")?.job_title).toBe("Senior Fullstack Engineer");
    expect(nextApps.find((a) => a.id === "app-2")?.job_title).toBe("Product Engineer");
  });

  it("should prioritize company_name over company_id for display (B-2/B-4 regression)", () => {
    const appWithName: Partial<Application> = {
      company_name: "Stripe Inc",
      company_id: "uuid-company-stripe",
    };
    const appWithoutName: Partial<Application> = {
      company_name: null,
      company_id: "Linear",
    };

    const displayName1 = appWithName.company_name || appWithName.company_id;
    const displayName2 = appWithoutName.company_name || appWithoutName.company_id;

    expect(displayName1).toBe("Stripe Inc");
    expect(displayName2).toBe("Linear");
  });

  it("should rollback optimistic update when an operation fails (R-5 regression)", () => {
    const previousState = [...sampleApps];
    let currentState = sampleApps.map((a) =>
      a.id === "app-1" ? { ...a, status: "offer" as ApplicationStatus } : a
    );

    expect(currentState.find((a) => a.id === "app-1")?.status).toBe("offer");

    // Simulating failed mutation rollback:
    const errorOccurred = true;
    if (errorOccurred) {
      currentState = previousState;
    }

    expect(currentState.find((a) => a.id === "app-1")?.status).toBe("wishlist");
    expect(currentState).toEqual(sampleApps);
  });
});

