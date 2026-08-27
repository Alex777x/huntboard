import { describe, it, expect } from "vitest";
import {
  formatRecruiterInviteTelegramMessage,
  sendTelegramMessage,
} from "./telegram";

describe("Telegram notifications helper", () => {
  it("formats recruiter invite message into Markdown", () => {
    const formatted = formatRecruiterInviteTelegramMessage({
      recruiterName: "Elena Rostova",
      companyName: "Revolut",
      role: "Lead Fullstack Engineer",
      message: "We loved your profile and want to chat.",
      inviteUrl: "http://localhost:3000/invites",
    });

    expect(formatted).toContain("HuntBoard: New Recruiter Interview Invite!");
    expect(formatted).toContain("Revolut");
    expect(formatted).toContain("Elena Rostova");
    expect(formatted).toContain("Lead Fullstack Engineer");
    expect(formatted).toContain("We loved your profile");
    expect(formatted).toContain("http://localhost:3000/invites");
  });

  it("gracefully returns error when bot token or chatId is missing", async () => {
    const result = await sendTelegramMessage({
      botToken: "",
      chatId: "",
      text: "Hello test",
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Missing");
  });
});
