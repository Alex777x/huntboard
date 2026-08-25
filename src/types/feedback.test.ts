import { describe, it, expect } from "vitest";
import { FeedbackSubmissionSchema } from "./feedback";

describe("Feedback Submission Schema Validation", () => {
  it("should validate a correct feature request", () => {
    const valid = {
      type: "feature",
      title: "Add export to JSON",
      description: "Allow downloading all applications data as a JSON file.",
      severity: "low",
      userEmail: "user@example.com",
    };

    const parsed = FeedbackSubmissionSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("should fail when title or description is too short", () => {
    const invalid = {
      type: "bug",
      title: "No",
      description: "short",
      userEmail: "user@example.com",
    };

    const parsed = FeedbackSubmissionSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("should fail when email is invalid", () => {
    const invalid = {
      type: "general",
      title: "Great platform",
      description: "I really enjoy using the AI tailoring features.",
      userEmail: "not-an-email",
    };

    const parsed = FeedbackSubmissionSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
