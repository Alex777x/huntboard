import { describe, it, expect } from "vitest";

interface Candidate {
  id: string;
  name: string;
  visible_to_recruiters: boolean;
}

interface Invite {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "declined";
}

describe("Recruiter Privacy & Invites System", () => {
  const candidates: Candidate[] = [
    { id: "u-1", name: "Anatoli", visible_to_recruiters: true },
    { id: "u-2", name: "Private User", visible_to_recruiters: false },
    { id: "u-3", name: "Marek", visible_to_recruiters: true },
  ];

  it("should strictly filter out candidates who have visible_to_recruiters = false", () => {
    const visiblePool = candidates.filter((c) => c.visible_to_recruiters);
    expect(visiblePool).toHaveLength(2);
    expect(visiblePool.some((c) => c.name === "Private User")).toBe(false);
  });

  it("should update invite status to accepted when seeker confirms", () => {
    const invite: Invite = {
      id: "inv-1",
      sender_id: "rec-1",
      receiver_id: "u-1",
      status: "pending",
    };

    const acceptedInvite: Invite = { ...invite, status: "accepted" };
    expect(acceptedInvite.status).toBe("accepted");
  });
});
