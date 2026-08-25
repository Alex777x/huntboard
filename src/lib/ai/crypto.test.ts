import { describe, it, expect } from "vitest";
import { encryptApiKey, decryptApiKey } from "./crypto";

describe("AI API Key Encryption & Decryption (AES-256-GCM)", () => {
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
});
