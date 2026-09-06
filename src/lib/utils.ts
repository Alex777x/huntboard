import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | null | undefined,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  if (amount == null) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(
  date: string | Date | null | undefined,
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, options ?? {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Format a salary range in compact notation (e.g. "$140k – $180k").
 * Uses Intl.NumberFormat with compact notation for locale-aware display.
 */
export function formatSalaryCompact(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(n);

  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `${fmt(min)}+`;
  if (max != null) return `≤ ${fmt(max)}`;
  return "";
}

/**
 * Format a relative time string (e.g. "2 hours ago", "yesterday").
 * Falls back to formatted absolute date for times > 30 days ago.
 */
export function formatRelativeTime(
  date: string | Date | null | undefined,
  locale: string = "en-US"
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffSec < 60) return rtf.format(-diffSec, "second");
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  if (diffHr < 24) return rtf.format(-diffHr, "hour");
  if (diffDay < 30) return rtf.format(-diffDay, "day");

  // Fallback to absolute date for older timestamps
  return formatDate(d, locale);
}

/**
 * Format a number as a percentage with locale-aware decimal separator.
 */
export function formatPercent(
  value: number,
  locale: string = "en-US",
  fractionDigits: number = 1
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100);
}

/**
 * Locale-aware case-insensitive string search.
 * Returns true if target contains query, using locale-aware lowering.
 */
export function localeIncludes(
  target: string | null | undefined,
  query: string,
  locale?: string
): boolean {
  if (!target || !query) return false;
  return target.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale));
}

/**
 * Validates a URL for safe use in href attributes.
 * Prevents XSS via javascript: and other dangerous protocols.
 */
export function safeHref(url: string | null | undefined): string {
  if (!url) return "#";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  return "#";
}
