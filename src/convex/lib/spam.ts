import type { MutationCtx } from "../_generated/server";
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

type Countable = {
  createdAt: number;
  rateKey?: string;
};

async function countSince<Q extends { take(n: number): Promise<unknown[]> }>(
  query: Q,
  cutoff: number,
  cap: number,
): Promise<number> {
  const rows = await query.take(cap + 1);
  return rows.filter(
    (row) => (row as { createdAt: number }).createdAt >= cutoff,
  ).length;
}

/**
 * Enforce the rate limits for one public submission. `table` selects which
 * records to count; the caller passes the table-specific query builder.
 */
export async function enforceRateLimits(
  ctx: MutationCtx,
  opts: {
    email?: string;
    clientKey?: string;
    contentHash: string;
    /** Query (with by_createdAt index) for the table receiving the record. */
    recentByHash: (hash: string) => Promise<{ contentHash: string }[]>;
    /** Queries used for the hourly caps. */
    hourlyQueries: {
      byEmail?: (email: string) => { take(n: number): Promise<unknown[]> };
      byClientKey?: (
        key: string,
      ) => { take(n: number): Promise<unknown[]> };
      global: { take(n: number): Promise<unknown[]> };
    };
  },
) {
  const now = Date.now();

  // Duplicate suppression.
  const duplicates = await opts.recentByHash(opts.contentHash);
  if (duplicates.length > 0) {
    fail(
      "DUPLICATE_SUBMISSION",
      "An identical submission was received recently. If you need to add more detail, please wait a few minutes and send a follow-up.",
    );
  }

  const hourAgo = now - 60 * 60 * 1000;

  if (opts.email && opts.hourlyQueries.byEmail) {
    const count = await countSince(
      opts.hourlyQueries.byEmail(opts.email.toLowerCase()),
      hourAgo,
      SPAM.perEmailPerHour,
    );
    if (count >= SPAM.perEmailPerHour) {
      fail(
        "RATE_LIMITED",
        "Too many submissions from this address in the last hour. Please try again later.",
      );
    }
  }

  if (opts.clientKey && opts.hourlyQueries.byClientKey) {
    const count = await countSince(
      opts.hourlyQueries.byClientKey(opts.clientKey),
      hourAgo,
      SPAM.perIpKeyPerHour,
    );
    if (count >= SPAM.perIpKeyPerHour) {
      fail(
        "RATE_LIMITED",
        "Too many submissions in the last hour. Please try again later.",
      );
    }
  }

  const globalCount = await countSince(
    opts.hourlyQueries.global,
    hourAgo,
    SPAM.globalPerHour,
  );
  if (globalCount >= SPAM.globalPerHour) {
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
