import { describe, it, expect } from "vitest";
import { isPublicRoute, PUBLIC_ROUTES, PUBLIC_PREFIXES } from "./middleware";

describe("Middleware Route Protection & Auth Rules", () => {
  it("allows designated public pages without authentication", () => {
    expect(isPublicRoute("/")).toBe(true);
    expect(isPublicRoute("/login")).toBe(true);
    expect(isPublicRoute("/register")).toBe(true);
  });

  it("allows system static assets and auth callback prefixes", () => {
    expect(isPublicRoute("/auth/callback")).toBe(true);
    expect(isPublicRoute("/_next/static/chunks/main.js")).toBe(true);
    expect(isPublicRoute("/favicon.ico")).toBe(true);
    expect(isPublicRoute("/icon.svg")).toBe(true);
  });

  it("strictly protects all API routes against unauthenticated access (C-1 regression fix)", () => {
    expect(isPublicRoute("/api/ai")).toBe(false);
    expect(isPublicRoute("/api/ai/ats-score")).toBe(false);
    expect(isPublicRoute("/api/ai/cover-letter")).toBe(false);
    expect(isPublicRoute("/api/integrations/telegram")).toBe(false);
    expect(isPublicRoute("/api/integrations/extension")).toBe(false);
    expect(isPublicRoute("/api/unknown")).toBe(false);
  });

  it("strictly protects candidate, recruiter, and admin portals", () => {
    expect(isPublicRoute("/dashboard")).toBe(false);
    expect(isPublicRoute("/applications")).toBe(false);
    expect(isPublicRoute("/cv")).toBe(false);
    expect(isPublicRoute("/recruiter/jobs")).toBe(false);
    expect(isPublicRoute("/recruiter/talent")).toBe(false);
    expect(isPublicRoute("/admin/users")).toBe(false);
    expect(isPublicRoute("/admin/balance")).toBe(false);
  });

  it("ensures /api/ is NOT in PUBLIC_PREFIXES", () => {
    expect(PUBLIC_PREFIXES).not.toContain("/api/");
    expect(PUBLIC_PREFIXES).not.toContain("/api");
  });
});
