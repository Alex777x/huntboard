/**
 * Simple, performant in-memory sliding window rate limiter.
 * Suitable for protecting Next.js API routes against abuse and DoS.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default 60s)
  max?: number;      // Max requests allowed per window (default 60)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Checks if a given key (IP or user ID) has exceeded the rate limit.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  cleanup();

  const windowMs = options.windowMs ?? 60 * 1000; // 1 minute default
  const max = options.max ?? 60;                   // 60 req/min default
  const now = Date.now();

  const record = store.get(key);

  if (!record || now > record.resetTime) {
    // New window
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      limit: max,
      remaining: max - 1,
      resetTime: now + windowMs,
    };
  }

  // Window still active
  if (record.count >= max) {
    return {
      success: false,
      limit: max,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: max,
    remaining: max - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Clears the rate limit store (useful for tests).
 */
export function resetRateLimitStore(): void {
  store.clear();
}

const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "wp.pl",
  "onet.pl",
  "interia.pl",
  "o2.pl",
]);

/**
 * Validates that an email address belongs to a corporate domain rather than a free personal provider.
 */
export function isCorporateEmail(email: string): boolean {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1].includes(".")) return false;
  return !PUBLIC_EMAIL_DOMAINS.has(parts[1]);
}

