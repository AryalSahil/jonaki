/**
 * Shared constants for the Jonaki backend: status/category enums, size limits
 * and display labels. Keep in sync with the frontend label maps in
 * src/lib/labels.ts (which mirrors these for the admin UI).
 */

export const BUG_CATEGORIES = [
  "app-crash",
  "ai-detection",
  "voice",
  "vibration",
  "navigation",
  "apk-installation",
  "website",
  "other",
] as const;

export const SUGGESTION_CATEGORIES = [
  "accessibility",
  "voice-commands",
  "languages",
  "ai-detection",
  "navigation",
  "emergency",
  "other",
] as const;

export const CONTACT_CATEGORIES = [
  "general",
  "technical-support",
  "accessibility-feedback",
  "partnership",
  "other",
] as const;

export const BUG_STATUSES = [
  "new",
  "under-review",
  "in-progress",
  "resolved",
  "closed",
] as const;

export const SUGGESTION_STATUSES = [
  "new",
  "under-review",
  "planned",
  "in-progress",
  "completed",
  "declined",
] as const;

export const MESSAGE_STATUSES = ["unread", "read", "replied", "archived"] as const;

export const RELEASE_STATUSES = ["draft", "published", "unpublished"] as const;

/** Text field limits — enforced in schema validators and re-checked in handlers. */
export const LIMITS = {
  title: 140,
  description: 4000,
  steps: 2000,
  note: 2000,
  message: 4000,
  email: 200,
  deviceModel: 120,
  versionString: 60,
  releaseNotes: 8000,
  maintenanceMessage: 600,
  /** Maximum APK upload size (bytes). Keeps downloads inside Convex HTTP
   *  action response limits and storage sane on a free-tier project. */
  maxApkBytes: 60 * 1024 * 1024,
  /** Screenshot attachments on bug reports (bytes). */
  maxAttachmentBytes: 5 * 1024 * 1024,
  /** Only re-verify checksums by re-hashing files at or below this size. */
  maxChecksumVerifyBytes: 48 * 1024 * 1024,
} as const;

/** Server-side spam controls for public forms. */
export const SPAM = {
  /** Minimum milliseconds between form render and submit (bots are instant). */
  minFillMs: 2500,
  /** Identical content submitted again within this window is rejected. */
  duplicateWindowMs: 10 * 60 * 1000,
  /** Per-identifier hourly caps. */
  perEmailPerHour: 5,
  perIpKeyPerHour: 8,
  /** Site-wide caps per hour, all public forms combined. */
  globalPerHour: 40,
} as const;

export const TRACKING_PREFIX = {
  bug: "JKB-BUG",
  suggestion: "JKB-FEAT",
  contact: "JKB-MSG",
} as const;
