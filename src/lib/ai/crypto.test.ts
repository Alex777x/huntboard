import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { encryptApiKey, decryptApiKey } from "./crypto";

describe("AI API Key Encryption & Decryption (AES-256-GCM)", () => {
  const TEST_SECRET = "test-secret-key-for-unit-tests-only";

  beforeAll(() => {
    process.env.AI_ENCRYPTION_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    delete process.env.AI_ENCRYPTION_SECRET;
  });

  it("should encrypt and successfully decrypt an OpenAI key", () => {
    const rawKey = "sk-proj-testKey1234567890abcdefghijklmnopqrstuvwxyz";
    const encrypted = encryptApiKey(rawKey);

    expect(encrypted).not.toBe(rawKey);
    expect(encrypted.split(":")).toHaveLength(3); // iv:tag:ciphertext

    const decrypted = decryptApiKey(encrypted);
    expect(decrypted).toBe(rawKey);
  });

  it("should return empty string when empty input is provided", () => {
    expect(encryptApiKey("")).toBe("");
    expect(decryptApiKey("")).toBe("");
  });

  it("should handle corrupted or tampered ciphertext gracefully", () => {
    const corrupted = "deadbeef:12345678:invalidpayload";
    expect(decryptApiKey(corrupted)).toBe("");
  });

  it("should return empty string when AI_ENCRYPTION_SECRET is missing in production", () => {
    const originalSecret = process.env.AI_ENCRYPTION_SECRET;
    const originalEnv = process.env.NODE_ENV;
    delete process.env.AI_ENCRYPTION_SECRET;
    (process.env as any).NODE_ENV = "production";

    // encryptApiKey catches the error internally and returns ""
    expect(encryptApiKey("test-key")).toBe("");
    // decryptApiKey also catches the error internally and returns ""
    expect(decryptApiKey("some:encrypted:data")).toBe("");

    // Restore for other tests
    process.env.AI_ENCRYPTION_SECRET = originalSecret;
    (process.env as any).NODE_ENV = originalEnv;
  });
});
