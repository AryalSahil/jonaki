import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { fail, logActivity, requireAdmin } from "./lib/auth";
import {
  BUG_CATEGORIES,
  BUG_STATUSES,
  LIMITS,
  SUGGESTION_CATEGORIES,
  SUGGESTION_STATUSES,
  TRACKING_PREFIX,
} from "./lib/constants";
import {
  checkFillTime,
  checkHoneypot,
  cleanEmail,
  cleanText,
  contentFingerprint,
  enforceRateLimits,
  isValidEmail,
  trackingId,
} from "./lib/spam";
import { getSettings } from "./lib/settings";

/**
 * Public feedback: bug reports and feature suggestions.
 *
 * Nothing submitted here is ever returned to a public caller — there is no
 * public query for report contents, no public list, and no public tracking
 * lookup. Submissions are validated on the server, rate-limited, protected by
 * a honeypot, and deduplicated. Only administrators can read them.
 */

const bugCategoryValidator = v.union(
  ...BUG_CATEGORIES.map((c) => v.literal(c)),
);
const suggestionCategoryValidator = v.union(
  ...SUGGESTION_CATEGORIES.map((c) => v.literal(c)),
);
const bugStatusValidator = v.union(...BUG_STATUSES.map((s) => v.literal(s)));
const suggestionStatusValidator = v.union(
  ...SUGGESTION_STATUSES.map((s) => v.literal(s)),
);
const noteValidator = v.object({
  id: v.string(),
  body: v.string(),
  authorEmail: v.optional(v.string()),
  createdAt: v.number(),
});

/** Reject submissions while maintenance mode is on (admins are unaffected). */
async function assertNotInMaintenance(ctx: MutationCtx) {
  const settings = await getSettings(ctx);
  if (settings?.maintenanceEnabled) {
    fail(
      "MAINTENANCE",
      "The site is temporarily in maintenance mode, so new reports cannot be accepted right now. Please try again after maintenance ends.",
    );
  }
}

async function assertAttachmentsAllowed(
  ctx: MutationCtx,
  storageId: string | undefined,
) {
  if (!storageId) return;
  const meta = await ctx.db.system.get(storageId as Id<"_storage">);
  if (!meta) {
    fail("ATTACHMENT_MISSING", "The attached screenshot could not be found.");
  }
  const size = (meta as { size?: number }).size ?? 0;
  if (size > LIMITS.maxAttachmentBytes) {
    fail(
      "ATTACHMENT_TOO_LARGE",
      "The screenshot is larger than the 5 MB limit.",
    );
  }
  const type = String((meta as { contentType?: string }).contentType ?? "");
  if (type && !type.startsWith("image/")) {
    fail("ATTACHMENT_INVALID", "Only image screenshots can be attached.");
  }
}

/** Generate a bug/suggestion tracking id that is unique in its table. */
async function uniqueFeedbackTrackingId(
  ctx: MutationCtx,
  table: "bugReports" | "featureSuggestions",
  prefix: string,
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = trackingId(prefix);
    const existing = await ctx.db
      .query(table)
      .withIndex("by_trackingId", (q) => q.eq("trackingId", id))
      .unique();
    if (existing === null) return id;
  }
  throw new Error("Could not allocate a unique tracking id.");
}

/** Generate a contact reference id that is unique in its table. */
async function uniqueContactReferenceId(ctx: MutationCtx): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = trackingId(TRACKING_PREFIX.contact);
    const existing = await ctx.db
      .query("contactMessages")
      .withIndex("by_referenceId", (q) => q.eq("referenceId", id))
      .unique();
    if (existing === null) return id;
  }
  throw new Error("Could not allocate a unique reference id.");
}

/* ------------------------------------------------------------------ */
/*  Bug reports                                                        */
/* ------------------------------------------------------------------ */

/**
 * Public: a short-lived upload URL for a bug-report screenshot. The file is
 * validated when the report itself is submitted (type and size are checked
 * server-side before the report row is written), and it is only reachable by
 * administrators afterwards. Upload URLs expire in one hour.
 */
export const createAttachmentUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await assertNotInMaintenance(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const submitBugReport = mutation({
  args: {
    title: v.string(),
    category: bugCategoryValidator,
    description: v.string(),
    stepsToReproduce: v.optional(v.string()),
    deviceModel: v.optional(v.string()),
    androidVersion: v.optional(v.string()),
    appVersion: v.optional(v.string()),
    email: v.optional(v.string()),
    consentGiven: v.boolean(),
    attachmentStorageId: v.optional(v.string()),
    honeypot: v.optional(v.string()),
    renderedAt: v.number(),
    clientKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertNotInMaintenance(ctx);
    checkHoneypot(args.honeypot);
    checkFillTime(args.renderedAt);

    const title = cleanText(args.title, LIMITS.title);
    const description = cleanText(args.description, LIMITS.description);
    const email = args.email ? cleanEmail(args.email) : "";

    if (title.length < 5) {
      fail("INVALID_TITLE", "Please give the report a short, clear title.");
    }
    if (description.length < 20) {
      fail(
        "INVALID_DESCRIPTION",
        "Please describe the problem in at least a couple of sentences.",
      );
    }
    if (email && !isValidEmail(email)) {
      fail("INVALID_EMAIL", "That email address does not look correct.");
    }
    // Consent is required before any personal contact info or attachment is
    // accepted.
    if ((email || args.attachmentStorageId) && !args.consentGiven) {
      fail(
        "CONSENT_REQUIRED",
        "Please tick the consent box so we may store your contact details or screenshot with the report.",
      );
    }

    await assertAttachmentsAllowed(ctx, args.attachmentStorageId);

    const contentHash = contentFingerprint(title, description);
    const rateKey = args.clientKey
      ? contentFingerprint(args.clientKey)
      : undefined;

    const hourAgo = Date.now() - 60 * 60 * 1000;
    await enforceRateLimits({
      contentHash,
      duplicates: await ctx.db
        .query("bugReports")
        .withIndex("by_contentHash", (q) => q.eq("contentHash", contentHash))
        .take(3),
      emailRows: email
        ? await ctx.db
            .query("bugReports")
            .withIndex("by_createdAt", (q) => q.gte("createdAt", hourAgo))
            .filter((q) => q.eq(q.field("email"), email))
            .take(20)
        : undefined,
      clientKeyRows: rateKey
        ? await ctx.db
            .query("bugReports")
            .withIndex("by_createdAt", (q) => q.gte("createdAt", hourAgo))
            .filter((q) => q.eq(q.field("rateKey"), rateKey))
            .take(20)
        : undefined,
      globalRows: await ctx.db
        .query("bugReports")
        .withIndex("by_createdAt", (q) => q.gte("createdAt", hourAgo))
        .take(60),
    });

    const id = await uniqueFeedbackTrackingId(
      ctx,
      "bugReports",
      TRACKING_PREFIX.bug,
    );
    const now = Date.now();
    await ctx.db.insert("bugReports", {
      trackingId: id,
      title,
      category: args.category,
      description,
      stepsToReproduce: args.stepsToReproduce
        ? cleanText(args.stepsToReproduce, LIMITS.steps) || undefined
        : undefined,
      deviceModel: args.deviceModel
        ? cleanText(args.deviceModel, LIMITS.deviceModel) || undefined
        : undefined,
      androidVersion: args.androidVersion
        ? cleanText(args.androidVersion, LIMITS.versionString) || undefined
        : undefined,
      appVersion: args.appVersion
        ? cleanText(args.appVersion, LIMITS.versionString) || undefined
        : undefined,
      email: email || undefined,
      consentGiven: args.consentGiven,
      attachmentStorageId: args.attachmentStorageId,
      status: "new",
      internalNotes: [],
      contentHash,
      rateKey,
      createdAt: now,
      updatedAt: now,
    });

    return { trackingId: id };
  },
});

/* ------------------------------------------------------------------ */
/*  Feature suggestions                                                */
/* ------------------------------------------------------------------ */

export const submitSuggestion = mutation({
  args: {
    title: v.string(),
    category: suggestionCategoryValidator,
    description: v.string(),
    whyUseful: v.optional(v.string()),
    email: v.optional(v.string()),
    consentGiven: v.boolean(),
    honeypot: v.optional(v.string()),
    renderedAt: v.number(),
    clientKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertNotInMaintenance(ctx);
    checkHoneypot(args.honeypot);
    checkFillTime(args.renderedAt);

    const title = cleanText(args.title, LIMITS.title);
    const description = cleanText(args.description, LIMITS.description);
    const email = args.email ? cleanEmail(args.email) : "";

    if (title.length < 4) {
      fail("INVALID_TITLE", "Please give the suggestion a short title.");
    }
    if (description.length < 15) {
      fail(
        "INVALID_DESCRIPTION",
        "Please describe the suggestion in a little more detail.",
      );
    }
    if (email && !isValidEmail(email)) {
      fail("INVALID_EMAIL", "That email address does not look correct.");
    }
    if (email && !args.consentGiven) {
      fail(
        "CONSENT_REQUIRED",
        "Please tick the consent box so we may store your email address with the suggestion.",
      );
    }

    const contentHash = contentFingerprint(title, description);
    const rateKey = args.clientKey
      ? contentFingerprint(args.clientKey)
      : undefined;

    const hourAgo = Date.now() - 60 * 60 * 1000;
    await enforceRateLimits({
      contentHash,
      duplicates: await ctx.db
        .query("featureSuggestions")
        .withIndex("by_contentHash", (q) => q.eq("contentHash", contentHash))
        .take(3),
      emailRows: email
        ? await ctx.db
            .query("featureSuggestions")
            .withIndex("by_createdAt", (q) => q.gte("createdAt", hourAgo))
            .filter((q) => q.eq(q.field("email"), email))
            .take(20)
        : undefined,
      clientKeyRows: rateKey
        ? await ctx.db
            .query("featureSuggestions")
            .withIndex("by_createdAt", (q) => q.gte("createdAt", hourAgo))
            .filter((q) => q.eq(q.field("rateKey"), rateKey))
            .take(20)
        : undefined,
      globalRows: await ctx.db
        .query("featureSuggestions")
        .withIndex("by_createdAt", (q) => q.gte("createdAt", hourAgo))
        .take(60),
    });

    const id = await uniqueFeedbackTrackingId(
      ctx,
      "featureSuggestions",
      TRACKING_PREFIX.suggestion,
    );
    const now = Date.now();
    await ctx.db.insert("featureSuggestions", {
      trackingId: id,
      title,
      category: args.category,
      description,
      whyUseful: args.whyUseful
        ? cleanText(args.whyUseful, LIMITS.description) || undefined
        : undefined,
      email: email || undefined,
      consentGiven: args.consentGiven,
      status: "new",
      internalNotes: [],
      contentHash,
      rateKey,
      createdAt: now,
      updatedAt: now,
    });

    return { trackingId: id };
  },
});

/* ------------------------------------------------------------------ */
/*  Public roadmap: sanitized status updates published by an admin     */
/* ------------------------------------------------------------------ */

export const publicRoadmap = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const rows = await ctx.db
      .query("featureSuggestions")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
    return rows
      .filter(
        (r) =>
          typeof r.publicStatusUpdate === "string" &&
          r.publicStatusUpdate.trim().length > 0,
      )
      .slice(0, 20)
      .map((r) => ({
        trackingId: r.trackingId,
        title: r.title,
        status: r.status,
        publicStatusUpdate: r.publicStatusUpdate as string,
        updatedAt: r.updatedAt,
      }));
  },
});

/* ------------------------------------------------------------------ */
/*  Admin: list, search, filter, update, notes, delete                 */
/* ------------------------------------------------------------------ */

const listFilters = {
  status: v.optional(v.string()),
  category: v.optional(v.string()),
  search: v.optional(v.string()),
};

export const adminListBugs = query({
  args: listFilters,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let rows = await ctx.db.query("bugReports").withIndex("by_createdAt").take(300);
    if (args.status) rows = rows.filter((r) => r.status === args.status);
    if (args.category) rows = rows.filter((r) => r.category === args.category);
    if (args.search) {
      const needle = args.search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.trackingId.toLowerCase().includes(needle) ||
          r.title.toLowerCase().includes(needle),
      );
    }
    return rows.map((r) => ({
      _id: r._id,
      trackingId: r.trackingId,
      title: r.title,
      category: r.category,
      status: r.status,
      email: r.email ?? null,
      deviceModel: r.deviceModel ?? null,
      androidVersion: r.androidVersion ?? null,
      appVersion: r.appVersion ?? null,
      hasAttachment: !!r.attachmentStorageId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  },
});

export const adminGetBug = query({
  args: { id: v.id("bugReports") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const r = await ctx.db.get(args.id);
    if (!r) return null;
    return {
      _id: r._id,
      trackingId: r.trackingId,
      title: r.title,
      category: r.category,
      description: r.description,
      stepsToReproduce: r.stepsToReproduce ?? null,
      deviceModel: r.deviceModel ?? null,
      androidVersion: r.androidVersion ?? null,
      appVersion: r.appVersion ?? null,
      email: r.email ?? null,
      status: r.status,
      internalNotes: r.internalNotes,
      resolution: r.resolution ?? null,
      attachmentStorageId: r.attachmentStorageId ?? null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  },
});

/** Admin: short-lived signed URL to view a report screenshot. */
export const adminAttachmentUrl = query({
  args: { id: v.id("bugReports") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const r = await ctx.db.get(args.id);
    if (!r?.attachmentStorageId) return null;
    return await ctx.storage.getUrl(
      r.attachmentStorageId as Parameters<
        QueryCtx["storage"]["getUrl"]
      >[0],
    );
  },
});

export const adminUpdateBug = mutation({
  args: {
    id: v.id("bugReports"),
    status: v.optional(bugStatusValidator),
    resolution: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const r = await ctx.db.get(args.id);
    if (!r) fail("NOT_FOUND", "That report no longer exists.");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.status) patch.status = args.status;
    if (args.resolution !== undefined) {
      patch.resolution = cleanText(args.resolution, LIMITS.note);
    }
    if (args.note && args.note.trim()) {
      patch.internalNotes = [
        ...r.internalNotes,
        {
          id: crypto.randomUUID(),
          body: cleanText(args.note, LIMITS.note),
          authorEmail: admin.email,
          createdAt: Date.now(),
        },
      ];
    }
    await ctx.db.patch(args.id, patch);
    await logActivity(ctx, admin, {
      action: "bug.updated",
      targetType: "bugReport",
      targetId: args.id,
      detail: args.status ? `status → ${args.status}` : undefined,
    });
  },
});

export const adminDeleteBug = mutation({
  args: { id: v.id("bugReports"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const r = await ctx.db.get(args.id);
    if (!r) fail("NOT_FOUND", "That report no longer exists.");
    if (r.attachmentStorageId) {
      await ctx.storage.delete(r.attachmentStorageId as Id<"_storage">);
    }
    await ctx.db.delete(args.id);
    await logActivity(ctx, admin, {
      action: "bug.deleted",
      targetType: "bugReport",
      targetId: args.id,
      detail: args.reason
        ? `deleted: ${cleanText(args.reason, LIMITS.note)}`
        : "deleted",
    });
  },
});

export const adminListSuggestions = query({
  args: listFilters,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let rows = await ctx.db
      .query("featureSuggestions")
      .withIndex("by_createdAt")
      .take(300);
    if (args.status) rows = rows.filter((r) => r.status === args.status);
    if (args.category) rows = rows.filter((r) => r.category === args.category);
    if (args.search) {
      const needle = args.search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.trackingId.toLowerCase().includes(needle) ||
          r.title.toLowerCase().includes(needle),
      );
    }
    return rows.map((r) => ({
      _id: r._id,
      trackingId: r.trackingId,
      title: r.title,
      category: r.category,
      status: r.status,
      email: r.email ?? null,
      hasPublicUpdate: !!r.publicStatusUpdate,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  },
});

export const adminGetSuggestion = query({
  args: { id: v.id("featureSuggestions") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const r = await ctx.db.get(args.id);
    if (!r) return null;
    return {
      _id: r._id,
      trackingId: r.trackingId,
      title: r.title,
      category: r.category,
      description: r.description,
      whyUseful: r.whyUseful ?? null,
      email: r.email ?? null,
      status: r.status,
      internalNotes: r.internalNotes,
      decision: r.decision ?? null,
      publicStatusUpdate: r.publicStatusUpdate ?? null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  },
});

export const adminUpdateSuggestion = mutation({
  args: {
    id: v.id("featureSuggestions"),
    status: v.optional(suggestionStatusValidator),
    decision: v.optional(v.string()),
    note: v.optional(v.string()),
    /** Sanitized update shown on the public roadmap. Empty string clears it. */
    publicStatusUpdate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const r = await ctx.db.get(args.id);
    if (!r) fail("NOT_FOUND", "That suggestion no longer exists.");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.status) patch.status = args.status;
    if (args.decision !== undefined) {
      patch.decision = cleanText(args.decision, LIMITS.note);
    }
    if (args.publicStatusUpdate !== undefined) {
      patch.publicStatusUpdate =
        cleanText(args.publicStatusUpdate, LIMITS.note) || undefined;
    }
    if (args.note && args.note.trim()) {
      patch.internalNotes = [
        ...r.internalNotes,
        {
          id: crypto.randomUUID(),
          body: cleanText(args.note, LIMITS.note),
          authorEmail: admin.email,
          createdAt: Date.now(),
        },
      ];
    }
    await ctx.db.patch(args.id, patch);
    await logActivity(ctx, admin, {
      action: "suggestion.updated",
      targetType: "featureSuggestion",
      targetId: args.id,
      detail: args.status ? `status → ${args.status}` : undefined,
    });
  },
});

export const adminDeleteSuggestion = mutation({
  args: { id: v.id("featureSuggestions"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const r = await ctx.db.get(args.id);
    if (!r) fail("NOT_FOUND", "That suggestion no longer exists.");
    await ctx.db.delete(args.id);
    await logActivity(ctx, admin, {
      action: "suggestion.deleted",
      targetType: "featureSuggestion",
      targetId: args.id,
      detail: args.reason
        ? `deleted: ${cleanText(args.reason, LIMITS.note)}`
        : "deleted",
    });
  },
});
