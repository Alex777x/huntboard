import { describe, it, expect } from "vitest";
import {
  formatRecruiterInviteTelegramMessage,
  sendTelegramMessage,
} from "./telegram";

describe("Telegram notifications helper", () => {
  it("formats recruiter invite message into HTML with safe escaping", () => {
    const formatted = formatRecruiterInviteTelegramMessage({
      recruiterName: "Elena <Rostova>",
      companyName: "Revolut & Co",
      role: "Lead Fullstack Engineer",
      message: "We loved your profile & want to chat.",
      inviteUrl: "http://localhost:3000/invites",
    });

    expect(formatted).toContain("<b>HuntBoard: New Recruiter Interview Invite!</b>");
    expect(formatted).toContain("Revolut &amp; Co");
    expect(formatted).toContain("Elena &lt;Rostova&gt;");
    expect(formatted).toContain("Lead Fullstack Engineer");
    expect(formatted).toContain("<i>We loved your profile &amp; want to chat.</i>");
    expect(formatted).toContain('<a href="http://localhost:3000/invites">Review &amp; Accept on HuntBoard</a>');
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
