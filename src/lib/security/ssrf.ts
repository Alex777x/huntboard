/**
 * SSRF (Server-Side Request Forgery) protection & URL validation utility.
 * Enforces safe public HTTP/HTTPS destinations and blocks private/loopback/metadata endpoints.
 */

const PRIVATE_IP_REGEXES = [
  /^127\./,                    // Loopback IPv4 (127.0.0.0/8)
  /^10\./,                     // Private IPv4 (10.0.0.0/8)
  /^192\.168\./,               // Private IPv4 (192.168.0.0/16)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private IPv4 (172.16.0.0/12)
  /^169\.254\./,               // Link-local / Cloud Metadata (169.254.0.0/16)
  /^0\./,                      // Broadcast / Zero address
];

const BLOCKED_HOSTS = new Set([
  "localhost",
  "::1",
  "[::1]",
  "0.0.0.0",
  "instance-data",             // Cloud provider metadata
  "metadata.google.internal",  // GCP metadata
]);

/**
 * Validates whether a given URL is safe for server-side processing or external linking.
 * Returns true only if protocol is http/https and host does not resolve to a private/internal address.
 */
export function isSafePublicUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  if (rawUrl.length > 2048) return false;

  try {
    const parsed = new URL(rawUrl.trim());

    // Only allow HTTP/HTTPS
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    const cleanHost = host.replace(/^\[|\]$/g, "");

    // Check exact blocked hosts
    if (BLOCKED_HOSTS.has(host) || BLOCKED_HOSTS.has(cleanHost)) {
      return false;
    }

    // Check local / internal TLDs
    if (host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".lan")) {
      return false;
    }

    // Check private/reserved IP patterns
    for (const regex of PRIVATE_IP_REGEXES) {
      if (regex.test(host)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}
