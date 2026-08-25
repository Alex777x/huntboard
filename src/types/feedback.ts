import { z } from "zod";

export const FeedbackTypeSchema = z.enum(["feature", "bug", "general"]);
export const FeedbackSeveritySchema = z.enum(["low", "medium", "high", "critical"]);
export const FeedbackStatusSchema = z.enum(["pending", "in_review", "planned", "resolved", "dismissed"]);

export const FeedbackSubmissionSchema = z.object({
  type: FeedbackTypeSchema,
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Please provide more details (at least 10 characters)"),
  severity: FeedbackSeveritySchema.optional().default("medium"),
  pageUrl: z.string().optional(),
  userEmail: z.string().email("Valid email required for status updates"),
});

export type FeedbackSubmission = z.infer<typeof FeedbackSubmissionSchema>;

export interface FeedbackTicket {
  id: string;
  type: "feature" | "bug" | "general";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_review" | "planned" | "resolved" | "dismissed";
  userEmail: string;
  userName: string;
  createdAt: string;
  adminNotes?: string;
  upvotes?: number;
}
