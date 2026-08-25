import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getSecretKey(): Buffer {
  const secret = process.env.AI_ENCRYPTION_SECRET || "huntboard-super-secure-32-byte-key-2026!";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts sensitive string (like an AI API Key) using AES-256-GCM.
 */
export function encryptApiKey(text: string): string {
  if (!text) return "";
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    // Format: iv:tag:encryptedHex
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
  } catch {
    return "";
  }
}

/**
 * Decrypts an encrypted string using AES-256-GCM.
 */
export function decryptApiKey(encryptedData: string): string {
  if (!encryptedData || typeof encryptedData !== "string") return "";
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) return "";

    const [ivHex, tagHex, encryptedHex] = parts;
    if (!ivHex || !tagHex || !encryptedHex) return "";

    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");

    // Strict boundary validation against corrupted lengths
    if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) {
      return "";
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    // Return empty on decryption error without crashing or leaking details
    return "";
  }
}
