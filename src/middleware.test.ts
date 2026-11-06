import { describe, it, expect } from "vitest";
import { isPublicRoute, isRoleAuthorizedForPath, PUBLIC_PREFIXES } from "./middleware";
import { isCorporateEmail } from "./lib/security/rate-limit";

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
    expect(isPublicRoute("/manifest.webmanifest")).toBe(true);
    expect(isPublicRoute("/sw.js")).toBe(true);
  });

  it("strictly protects all API routes against unauthenticated access (C-1 regression fix)", () => {
    expect(isPublicRoute("/api/ai")).toBe(false);
    expect(isPublicRoute("/api/settings/secrets")).toBe(false);
    expect(isPublicRoute("/api/recruiter/verify/send-code")).toBe(false);
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

  it("enforces role-based authorization on /admin and /recruiter routes", () => {
    // Admin routes require strictly "admin"
    expect(isRoleAuthorizedForPath("/admin/users", "admin")).toBe(true);
    expect(isRoleAuthorizedForPath("/admin/balance", "recruiter")).toBe(false);
    expect(isRoleAuthorizedForPath("/admin/feedback", "seeker")).toBe(false);
    expect(isRoleAuthorizedForPath("/admin/users", null)).toBe(false);

    // Recruiter routes allow "recruiter" and "admin", block "seeker" and null
    expect(isRoleAuthorizedForPath("/recruiter/jobs", "recruiter")).toBe(true);
    expect(isRoleAuthorizedForPath("/recruiter/talent", "admin")).toBe(true);
    expect(isRoleAuthorizedForPath("/recruiter/verify", "seeker")).toBe(false);
    expect(isRoleAuthorizedForPath("/recruiter/pipeline", null)).toBe(false);

    // Seeker routes allow any authenticated role
    expect(isRoleAuthorizedForPath("/dashboard", "seeker")).toBe(true);
    expect(isRoleAuthorizedForPath("/dashboard", "recruiter")).toBe(true);
  });

  it("enforces corporate email domain validation for recruiter verification", () => {
    expect(isCorporateEmail("hr@allegro.pl")).toBe(true);
    expect(isCorporateEmail("talent@cdprojektred.com")).toBe(true);
    expect(isCorporateEmail("user@gmail.com")).toBe(false);
    expect(isCorporateEmail("user@wp.pl")).toBe(false);
    expect(isCorporateEmail("user@onet.pl")).toBe(false);
    expect(isCorporateEmail("invalid-email")).toBe(false);
  });
});
