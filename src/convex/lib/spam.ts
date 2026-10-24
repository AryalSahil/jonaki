import { fail } from "./auth";
import { SPAM } from "./constants";

/**
 * Server-side spam controls for the public forms (bug report, feature
 * suggestion, contact). We deliberately combine several cheap signals instead
 * of any single gate:
 *
 * 1. Honeypot — a hidden field humans never fill. Checked first.
 * 2. Fill-time — the form must have been rendered at least `minFillMs` ago.
 * 3. Duplicate suppression — identical content inside the window is rejected.
 * 4. Rate limits — per email, per coarse client key, and site-wide per hour.
 *
 * The client key is a random identifier generated in the browser and hashed
 * here before use; raw IPs are never stored.
 */

/** Non-cryptographic content fingerprint (FNV-1a, 32-bit) for dedupe checks. */
export function contentFingerprint(...parts: string[]): string {
  const input = parts.join("\u0000").trim().toLowerCase();
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/** Reject obviously automated submissions. */
export function checkHoneypot(honeypot: string | undefined) {
  if (honeypot && honeypot.trim().length > 0) {
    // Silently accept-shaped failure: do not tell bots what tripped them.
    fail(
      "SPAM_REJECTED",
      "Your submission could not be accepted. Please try again or contact support.",
    );
  }
}

export function checkFillTime(renderedAt: number) {
  const elapsed = Date.now() - renderedAt;
  if (!Number.isFinite(renderedAt) || elapsed < SPAM.minFillMs) {
    fail(
      "SUBMITTED_TOO_FAST",
      "That was submitted unusually quickly. Please review the form and send it again.",
    );
  }
}

/** Enforce duplicate suppression and rate limits for one public submission.
 *
 * The caller supplies already-fetched rows (created within the last hour) so
 * this helper stays agnostic of table names and index shapes. */
export async function enforceRateLimits(opts: {
  contentHash: string;
  /** Rows with a matching contentHash, for duplicate suppression. */
  duplicates: { contentHash: string }[];
  /** Rows from the same email in the last hour. */
  emailRows?: { createdAt: number }[];
  /** Rows from the same client key in the last hour. */
  clientKeyRows?: { createdAt: number }[];
  /** All rows in the last hour, across the form. */
  globalRows: { createdAt: number }[];
}) {
  const hourAgo = Date.now() - 60 * 60 * 1000;
  const within = (rows: { createdAt: number }[]) =>
    rows.filter((row) => row.createdAt >= hourAgo).length;

  if (opts.duplicates.length > 0) {
    fail(
      "DUPLICATE_SUBMISSION",
      "An identical submission was received recently. If you need to add more detail, please wait a few minutes and send a follow-up.",
    );
  }

  if (opts.emailRows && within(opts.emailRows) >= SPAM.perEmailPerHour) {
    fail(
      "RATE_LIMITED",
      "Too many submissions from this address in the last hour. Please try again later.",
    );
  }

  if (
    opts.clientKeyRows &&
    within(opts.clientKeyRows) >= SPAM.perIpKeyPerHour
  ) {
    fail(
      "RATE_LIMITED",
      "Too many submissions in the last hour. Please try again later.",
    );
  }

  if (within(opts.globalRows) >= SPAM.globalPerHour) {
    fail(
      "RATE_LIMITED",
      "The form is receiving a high volume of submissions right now. Please try again shortly.",
    );
  }
}

/** Unique tracking id, e.g. JKB-BUG-4F7A2C9D. */
export function trackingId(prefix: string): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `${prefix}-${hex}`;
}

/** Trim + collapse, guarding against absurd payloads before validation. */
export function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function cleanEmail(value: unknown): string {
  return cleanText(value, SPAM_EMAIL_MAX).toLowerCase();
}

const SPAM_EMAIL_MAX = 200;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 200;
}
