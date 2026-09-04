import { describe, it, expect } from "vitest";
import { isSafePublicUrl } from "./ssrf";

describe("SSRF Prevention: isSafePublicUrl()", () => {
  it("allows safe public URLs", () => {
    expect(isSafePublicUrl("https://linkedin.com/jobs/view/12345")).toBe(true);
    expect(isSafePublicUrl("https://indeed.com/viewjob?jk=abcdef")).toBe(true);
    expect(isSafePublicUrl("http://company.org/careers")).toBe(true);
  });

  it("blocks cloud metadata service endpoints (AWS/GCP/Azure #1 SSRF target)", () => {
    expect(isSafePublicUrl("http://169.254.169.254/latest/meta-data/")).toBe(false);
    expect(isSafePublicUrl("http://169.254.169.254/computeMetadata/v1/")).toBe(false);
    expect(isSafePublicUrl("http://metadata.google.internal/")).toBe(false);
    expect(isSafePublicUrl("http://instance-data/latest/meta-data")).toBe(false);
  });

  it("blocks localhost and loopback IPv4/IPv6 addresses", () => {
    expect(isSafePublicUrl("http://localhost:3000/internal")).toBe(false);
    expect(isSafePublicUrl("http://localhost:8080")).toBe(false);
    expect(isSafePublicUrl("http://127.0.0.1:5432")).toBe(false);
    expect(isSafePublicUrl("http://127.0.1.1")).toBe(false);
    expect(isSafePublicUrl("http://[::1]:3000")).toBe(false);
    expect(isSafePublicUrl("http://0.0.0.0:8000")).toBe(false);
  });

  it("blocks RFC 1918 private IPv4 subnets", () => {
    expect(isSafePublicUrl("http://10.0.0.1/admin")).toBe(false);
    expect(isSafePublicUrl("http://192.168.1.1/router")).toBe(false);
    expect(isSafePublicUrl("http://172.16.0.10")).toBe(false);
    expect(isSafePublicUrl("http://172.31.255.255")).toBe(false);
  });

  it("blocks internal/local domain names", () => {
    expect(isSafePublicUrl("http://database.local")).toBe(false);
    expect(isSafePublicUrl("http://service.internal")).toBe(false);
    expect(isSafePublicUrl("http://router.lan")).toBe(false);
  });

  it("blocks non-HTTP/HTTPS schemes", () => {
    expect(isSafePublicUrl("file:///etc/passwd")).toBe(false);
    expect(isSafePublicUrl("gopher://127.0.0.1:6379")).toBe(false);
    expect(isSafePublicUrl("ftp://ftp.example.com")).toBe(false);
    expect(isSafePublicUrl("javascript:alert(1)")).toBe(false);
  });

  it("handles null, empty, malformed, and oversized inputs", () => {
    expect(isSafePublicUrl(null)).toBe(false);
    expect(isSafePublicUrl("")).toBe(false);
    expect(isSafePublicUrl("not a url")).toBe(false);
    expect(isSafePublicUrl("https://" + "a".repeat(2100))).toBe(false);
  });
});
