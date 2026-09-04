import { describe, it, expect } from "vitest";
import { safeHref } from "./utils";

describe("XSS Prevention: safeHref()", () => {
  it("allows legitimate https and http URLs", () => {
    expect(safeHref("https://linkedin.com/jobs")).toBe("https://linkedin.com/jobs");
    expect(safeHref("http://example.com")).toBe("http://example.com");
    expect(safeHref("  https://company.org  ")).toBe("https://company.org");
  });

  it("allows safe mailto links", () => {
    expect(safeHref("mailto:recruiter@company.com")).toBe("mailto:recruiter@company.com");
  });

  it("strictly sanitizes javascript: pseudo-protocol to prevent XSS execution", () => {
    expect(safeHref("javascript:alert(document.cookie)")).toBe("#");
    expect(safeHref("JAVASCRIPT:alert(1)")).toBe("#");
    expect(safeHref("javascript:void(0)")).toBe("#");
  });

  it("blocks dangerous non-web protocols (file, data, vbscript)", () => {
    expect(safeHref("data:text/html,<script>alert(1)</script>")).toBe("#");
    expect(safeHref("file:///etc/passwd")).toBe("#");
    expect(safeHref("vbscript:msgbox(1)")).toBe("#");
  });

  it("returns fallback # for null, undefined, empty, or whitespace strings", () => {
    expect(safeHref(null)).toBe("#");
    expect(safeHref(undefined)).toBe("#");
    expect(safeHref("")).toBe("#");
    expect(safeHref("   ")).toBe("#");
  });
});
