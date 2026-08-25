import { describe, it, expect } from "vitest";

interface Post {
  id: string;
  upvotes: number;
  downvotes: number;
  userVote: "up" | "down" | null;
}

function applyVote(post: Post, direction: "up" | "down"): Post {
  let newUp = post.upvotes;
  let newDown = post.downvotes;
  let newUserVote: "up" | "down" | null = direction;

  if (post.userVote === direction) {
    // Toggle off
    newUserVote = null;
    if (direction === "up") newUp -= 1;
    if (direction === "down") newDown -= 1;
  } else {
    // Switch vote
    if (post.userVote === "up") newUp -= 1;
    if (post.userVote === "down") newDown -= 1;

    if (direction === "up") newUp += 1;
    if (direction === "down") newDown += 1;
  }

  return {
    ...post,
    upvotes: Math.max(0, newUp),
    downvotes: Math.max(0, newDown),
    userVote: newUserVote,
  };
}

describe("Community Voting Engine", () => {
  it("should increment upvotes when user votes up from neutral", () => {
    const post: Post = { id: "p1", upvotes: 10, downvotes: 1, userVote: null };
    const voted = applyVote(post, "up");

    expect(voted.upvotes).toBe(11);
    expect(voted.downvotes).toBe(1);
    expect(voted.userVote).toBe("up");
  });

  it("should toggle off upvote when user clicks upvote again", () => {
    const post: Post = { id: "p1", upvotes: 11, downvotes: 1, userVote: "up" };
    const voted = applyVote(post, "up");

    expect(voted.upvotes).toBe(10);
    expect(voted.userVote).toBe(null);
  });

  it("should switch from upvote to downvote seamlessly", () => {
    const post: Post = { id: "p1", upvotes: 11, downvotes: 1, userVote: "up" };
    const voted = applyVote(post, "down");

    expect(voted.upvotes).toBe(10);
    expect(voted.downvotes).toBe(2);
    expect(voted.userVote).toBe("down");
  });
});
