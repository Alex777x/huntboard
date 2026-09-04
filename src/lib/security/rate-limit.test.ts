import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimitStore } from "./rate-limit";

describe("Rate Limiting Security Control", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("allows requests under the rate limit threshold", () => {
    const result1 = checkRateLimit("user-1", { max: 3, windowMs: 1000 });
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = checkRateLimit("user-1", { max: 3, windowMs: 1000 });
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = checkRateLimit("user-1", { max: 3, windowMs: 1000 });
    expect(result3.success).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it("blocks requests that exceed the rate limit threshold", () => {
    // Consume 2 allowed requests
    checkRateLimit("user-2", { max: 2, windowMs: 1000 });
    checkRateLimit("user-2", { max: 2, windowMs: 1000 });

    // Third request should be blocked
    const blocked = checkRateLimit("user-2", { max: 2, windowMs: 1000 });
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("isolates rate limits between distinct keys", () => {
    checkRateLimit("ip-1", { max: 1, windowMs: 1000 });
    const blockedForIp1 = checkRateLimit("ip-1", { max: 1, windowMs: 1000 });
    expect(blockedForIp1.success).toBe(false);

    // ip-2 should still be allowed
    const allowedForIp2 = checkRateLimit("ip-2", { max: 1, windowMs: 1000 });
    expect(allowedForIp2.success).toBe(true);
  });
});
