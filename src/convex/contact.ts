import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { fail, logActivity, requireAdmin } from "./lib/auth";
import {
  CONTACT_CATEGORIES,
  LIMITS,
  MESSAGE_STATUSES,
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
 * Public contact form. Messages are private: there is no public query that
 * returns their contents, and only administrators can read, reply-mark, or
 * delete them.
 */

const contactCategoryValidator = v.union(
  ...CONTACT_CATEGORIES.map((c) => v.literal(c)),
);
const messageStatusValidator = v.union(
  ...MESSAGE_STATUSES.map((s) => v.literal(s)),
);

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    category: contactCategoryValidator,
    honeypot: v.optional(v.string()),
    renderedAt: v.number(),
    clientKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const settings = await getSettings(ctx);
    if (settings?.maintenanceEnabled) {
      fail(
        "MAINTENANCE",
        "The site is temporarily in maintenance mode, so new messages cannot be accepted right now. Please try again after maintenance ends.",
      );
    }

    checkHoneypot(args.honeypot);
    checkFillTime(args.renderedAt);

    const name = cleanText(args.name, LIMITS.deviceModel);
    const email = cleanEmail(args.email);
    const subject = cleanText(args.subject, LIMITS.title);
    const message = cleanText(args.message, LIMITS.message);

    if (name.length < 2) {
      fail("INVALID_NAME", "Please tell us your name.");
    }
    if (!isValidEmail(email)) {
      fail(
        "INVALID_EMAIL",
        "Please enter an email address we can reply to.",
      );
    }
    if (subject.length < 3) {
      fail("INVALID_SUBJECT", "Please give the message a short subject.");
    }
    if (message.length < 10) {
      fail(
        "INVALID_MESSAGE",
        "Please write a slightly longer message so we can help.",
      );
    }

    const contentHash = contentFingerprint(email, subject, message);
    const rateKey = args.clientKey
      ? contentFingerprint(args.clientKey)
      : undefined;

    const hourAgo = Date.now() - 60 * 60 * 1000;
    await enforceRateLimits({
      contentHash,
      duplicates: await ctx.db
        .query("contactMessages")
        .withIndex("by_contentHash", (q) => q.eq("contentHash", contentHash))
        .take(3),
      emailRows: await ctx.db
        .query("contactMessages")
        .withIndex("by_createdAt", (q) => q.gte("createdAt", hourAgo))
        .filter((q) => q.eq(q.field("email"), email))
        .take(20),
      clientKeyRows: rateKey
        ? await ctx.db
            .query("contactMessages")
            .withIndex("by_createdAt", (q) => q.gte("createdAt", hourAgo))
            .filter((q) => q.eq(q.field("rateKey"), rateKey))
            .take(20)
        : undefined,
      globalRows: await ctx.db
        .query("contactMessages")
        .withIndex("by_createdAt", (q) => q.gte("createdAt", hourAgo))
        .take(60),
    });

    // Allocate a unique reference id.
    let referenceId = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = trackingId(TRACKING_PREFIX.contact);
      const existing = await ctx.db
        .query("contactMessages")
        .withIndex("by_referenceId", (q) => q.eq("referenceId", candidate))
        .unique();
      if (existing === null) {
        referenceId = candidate;
        break;
      }
    }
    if (!referenceId) {
      throw new Error("Could not allocate a unique reference id.");
    }

    const now = Date.now();
    await ctx.db.insert("contactMessages", {
      referenceId,
      name,
      email,
      subject,
      message,
      category: args.category,
      status: "unread",
      internalNotes: [],
      contentHash,
      rateKey,
      createdAt: now,
      updatedAt: now,
    });

    return { referenceId };
  },
});

/* ------------------------------------------------------------------ */
/*  Admin                                                              */
/* ------------------------------------------------------------------ */

export const adminList = query({
  args: {
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let rows = await ctx.db
      .query("contactMessages")
      .withIndex("by_createdAt")
      .take(300);
    if (args.status) rows = rows.filter((r) => r.status === args.status);
    if (args.category) rows = rows.filter((r) => r.category === args.category);
    if (args.search) {
      const needle = args.search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.referenceId.toLowerCase().includes(needle) ||
          r.subject.toLowerCase().includes(needle) ||
          r.name.toLowerCase().includes(needle) ||
          r.email.toLowerCase().includes(needle),
      );
    }
    return rows.map((r) => ({
      _id: r._id,
      referenceId: r.referenceId,
      name: r.name,
      email: r.email,
      subject: r.subject,
      category: r.category,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  },
});

export const adminGet = query({
  args: { id: v.id("contactMessages") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const r = await ctx.db.get(args.id);
    if (!r) return null;
    return {
      _id: r._id,
      referenceId: r.referenceId,
      name: r.name,
      email: r.email,
      subject: r.subject,
      message: r.message,
      category: r.category,
      status: r.status,
      internalNotes: r.internalNotes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  },
});

export const adminUpdate = mutation({
  args: {
    id: v.id("contactMessages"),
    status: v.optional(messageStatusValidator),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const r = await ctx.db.get(args.id);
    if (!r) fail("NOT_FOUND", "That message no longer exists.");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.status) patch.status = args.status;
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
      action: "contact.updated",
      targetType: "contactMessage",
      targetId: args.id,
      detail: args.status ? `status → ${args.status}` : undefined,
    });
  },
});

export const adminArchive = mutation({
  args: { id: v.id("contactMessages") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const r = await ctx.db.get(args.id);
    if (!r) fail("NOT_FOUND", "That message no longer exists.");
    await ctx.db.patch(args.id, { status: "archived", updatedAt: Date.now() });
    await logActivity(ctx, admin, {
      action: "contact.archived",
      targetType: "contactMessage",
      targetId: args.id,
    });
  },
});

export const adminDelete = mutation({
  args: { id: v.id("contactMessages"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const r = await ctx.db.get(args.id);
    if (!r) fail("NOT_FOUND", "That message no longer exists.");
    await ctx.db.delete(args.id);
    await logActivity(ctx, admin, {
      action: "contact.deleted",
      targetType: "contactMessage",
      targetId: args.id,
      detail: args.reason
        ? `deleted: ${cleanText(args.reason, LIMITS.note)}`
        : "deleted",
    });
  },
});
