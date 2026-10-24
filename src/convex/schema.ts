import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

import {
  BUG_CATEGORIES,
  BUG_STATUSES,
  CONTACT_CATEGORIES,
  MESSAGE_STATUSES,
  RELEASE_STATUSES,
  SUGGESTION_CATEGORIES,
  SUGGESTION_STATUSES,
  LIMITS,
} from "./lib/constants";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Field length limits are enforced in handlers (v.string has no max length).
const optionalText = (max: number) => v.optional(v.string());

const bugCategoryValidator = v.union(
  ...BUG_CATEGORIES.map((c) => v.literal(c)),
);
const suggestionCategoryValidator = v.union(
  ...SUGGESTION_CATEGORIES.map((c) => v.literal(c)),
);
const contactCategoryValidator = v.union(
  ...CONTACT_CATEGORIES.map((c) => v.literal(c)),
);
const bugStatusValidator = v.union(...BUG_STATUSES.map((s) => v.literal(s)));
const suggestionStatusValidator = v.union(
  ...SUGGESTION_STATUSES.map((s) => v.literal(s)),
);
const messageStatusValidator = v.union(
  ...MESSAGE_STATUSES.map((s) => v.literal(s)),
);
const releaseStatusValidator = v.union(
  ...RELEASE_STATUSES.map((s) => v.literal(s)),
);

const internalNoteValidator = v.object({
  id: v.string(),
  body: v.string(),
  authorEmail: optionalText(LIMITS.email),
  createdAt: v.number(),
});

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove or modify
      /** True while the admin still uses the owner-supplied bootstrap password. */
      mustChangePassword: v.optional(v.boolean()),
    }).index("email", ["email"]),

    /**
     * Uploaded Android releases. Binaries live in private Convex file storage;
     * this table stores the storage id plus verified metadata. Only "published"
     * releases are reachable from the public download endpoint.
     */
    appReleases: defineTable({
      version: v.string(),
      fileName: v.string(),
      fileSizeBytes: v.number(),
      minAndroid: optionalText(LIMITS.versionString),
      releaseDate: v.string(), // ISO date chosen by the admin
      releaseNotes: optionalText(LIMITS.releaseNotes),
      /** SHA-256 calculated on the server after upload. */
      sha256: v.string(),
      /** True only when the checksum was recomputed and matched the stored file. */
      checksumVerified: v.boolean(),
      storageId: v.string(), // storage id; kept as string to avoid system-table typing
      status: releaseStatusValidator,
      /** Server-side validation results recorded at upload time. */
      apkStructureOk: v.boolean(),
      apkValidationNotes: v.array(v.string()),
      uploadedBy: v.id("users"),
      uploadedByEmail: optionalText(LIMITS.email),
      createdAt: v.number(),
      publishedAt: v.optional(v.number()),
      unpublishedAt: v.optional(v.number()),
      downloadCount: v.number(),
    })
      .index("by_status", ["status"])
      .index("by_createdAt", ["createdAt"]),

    /** Public bug reports. Contents are only visible to administrators. */
    bugReports: defineTable({
      trackingId: v.string(),
      title: v.string(),
      category: bugCategoryValidator,
      description: v.string(),
      stepsToReproduce: optionalText(LIMITS.steps),
      deviceModel: optionalText(LIMITS.deviceModel),
      androidVersion: optionalText(LIMITS.versionString),
      appVersion: optionalText(LIMITS.versionString),
      email: optionalText(LIMITS.email),
      consentGiven: v.boolean(),
      attachmentStorageId: optionalText(LIMITS.versionString),
      attachmentName: optionalText(LIMITS.deviceModel),
      attachmentSizeBytes: v.optional(v.number()),
      status: bugStatusValidator,
      internalNotes: v.array(internalNoteValidator),
      resolution: optionalText(LIMITS.note),
      /** Non-reversible content fingerprint used for duplicate suppression. */
      contentHash: v.string(),
      /** Coarse client key (hash, never a raw IP) for rate limiting. */
      rateKey: optionalText(LIMITS.versionString),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_trackingId", ["trackingId"])
      .index("by_status", ["status"])
      .index("by_category", ["category"])
      .index("by_createdAt", ["createdAt"])
      .index("by_contentHash", ["contentHash"]),

    /** Public feature suggestions. Contents are only visible to administrators. */
    featureSuggestions: defineTable({
      trackingId: v.string(),
      title: v.string(),
      category: suggestionCategoryValidator,
      description: v.string(),
      whyUseful: optionalText(LIMITS.description),
      email: optionalText(LIMITS.email),
      consentGiven: v.boolean(),
      status: suggestionStatusValidator,
      internalNotes: v.array(internalNoteValidator),
      decision: optionalText(LIMITS.note),
      /** Sanitized public roadmap note, published only by explicit admin action. */
      publicStatusUpdate: optionalText(LIMITS.note),
      contentHash: v.string(),
      rateKey: optionalText(LIMITS.versionString),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_trackingId", ["trackingId"])
      .index("by_status", ["status"])
      .index("by_category", ["category"])
      .index("by_createdAt", ["createdAt"])
      .index("by_contentHash", ["contentHash"]),

    /** Public contact form submissions. Contents are only visible to administrators. */
    contactMessages: defineTable({
      referenceId: v.string(),
      name: v.string(),
      email: v.string(),
      subject: v.string(),
      message: v.string(),
      category: contactCategoryValidator,
      status: messageStatusValidator,
      internalNotes: v.array(internalNoteValidator),
      contentHash: v.string(),
      rateKey: optionalText(LIMITS.versionString),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_referenceId", ["referenceId"])
      .index("by_status", ["status"])
      .index("by_createdAt", ["createdAt"])
      .index("by_contentHash", ["contentHash"]),

    /** Database-backed website copy. The public site renders this, not hard-coded text. */
    siteContent: defineTable({
      key: v.literal("main"), // singleton
      heroHeadline: v.string(),
      heroDescription: v.string(),
      missionHeadline: v.string(),
      missionDescription: v.string(),
      features: v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          description: v.string(),
        }),
      ),
      faq: v.array(
        v.object({
          id: v.string(),
          question: v.string(),
          answer: v.string(),
        }),
      ),
      downloadHeadline: v.string(),
      downloadDescription: v.string(),
      supportEmail: optionalText(LIMITS.email),
      privacyPolicy: optionalText(LIMITS.description),
      termsOfUse: optionalText(LIMITS.description),
      updatedAt: v.number(),
      updatedBy: v.optional(v.id("users")),
    }).index("by_key", ["key"]),

    /** Global settings, including server-enforced maintenance mode. */
    siteSettings: defineTable({
      key: v.literal("main"), // singleton
      maintenanceEnabled: v.boolean(),
      maintenanceMessage: v.string(),
      maintenanceReopenAt: v.optional(v.number()),
      /** When true, maintenance also blocks public APK downloads. */
      blockDownloadsDuringMaintenance: v.boolean(),
      /** Friendly name shown in admin UI. */
      siteName: v.string(),
      retentionDays: v.number(), // auto-purge window for feedback/messages (0 = keep forever)
      updatedAt: v.number(),
      updatedBy: v.optional(v.id("users")),
    }).index("by_key", ["key"]),

    /** Audit trail of important administrator actions. */
    activityLogs: defineTable({
      actorId: v.optional(v.id("users")),
      actorEmail: optionalText(LIMITS.email),
      action: v.string(),
      targetType: optionalText(LIMITS.versionString),
      targetId: optionalText(LIMITS.versionString),
      detail: optionalText(LIMITS.note),
      createdAt: v.number(),
    })
      .index("by_createdAt", ["createdAt"])
      .index("by_action", ["action"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
