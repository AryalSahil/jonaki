import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { fail, logActivity, requireAdmin } from "./lib/auth";
import { LIMITS } from "./lib/constants";
import {
  cleanEmail,
  cleanText,
  isValidEmail,
} from "./lib/spam";
import {
  DEFAULT_CONTENT,
  clamp,
  clampOptional,
  getOrCreateSettings,
} from "./lib/settings";

/**
 * Database-backed website content, settings, and maintenance mode.
 *
 * The public site reads `publicState` on load. That query is the single
 * source of truth for maintenance mode: the client shell switches to the
 * maintenance page when it says so, and every state-changing public endpoint
 * (submissions, downloads) re-checks the same setting server-side. A query
 * parameter alone can never bypass it.
 */

/* ------------------------------------------------------------------ */
/*  Public                                                             */
/* ------------------------------------------------------------------ */

export const publicState = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const [content, settings] = await Promise.all([
      ctx.db
        .query("siteContent")
        .withIndex("by_key", (q) => q.eq("key", "main"))
        .unique(),
      ctx.db
        .query("siteSettings")
        .withIndex("by_key", (q) => q.eq("key", "main"))
        .unique(),
    ]);

    const merged = { ...DEFAULT_CONTENT, ...(content ?? {}) };

    return {
      siteName: settings?.siteName ?? "Jonaki",
      supportEmail: merged.supportEmail ?? null,
      maintenance: settings?.maintenanceEnabled
        ? {
            message: settings.maintenanceMessage,
            reopenAt: settings.maintenanceReopenAt ?? null,
          }
        : null,
      content: {
        heroHeadline: merged.heroHeadline,
        heroDescription: merged.heroDescription,
        missionHeadline: merged.missionHeadline,
        missionDescription: merged.missionDescription,
        features: merged.features,
        faq: merged.faq,
        downloadHeadline: merged.downloadHeadline,
        downloadDescription: merged.downloadDescription,
        privacyPolicy: merged.privacyPolicy ?? null,
        termsOfUse: merged.termsOfUse ?? null,
      },
    };
  },
});

/* ------------------------------------------------------------------ */
/*  Admin: website content                                             */
/* ------------------------------------------------------------------ */

const featureValidator = v.object({
  id: v.string(),
  title: v.string(),
  description: v.string(),
});

const faqValidator = v.object({
  id: v.string(),
  question: v.string(),
  answer: v.string(),
});

export const adminGetContent = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    return existing ?? DEFAULT_CONTENT;
  },
});

/** Fetch the singleton content doc, creating it on first edit. */
async function getOrCreateContent(ctx: MutationCtx) {
  const existing = await ctx.db
    .query("siteContent")
    .withIndex("by_key", (q) => q.eq("key", "main"))
    .unique();
  if (existing) return existing;
  const id = await ctx.db.insert("siteContent", DEFAULT_CONTENT);
  return (await ctx.db.get(id))!;
}

export const adminUpdateContent = mutation({
  args: {
    heroHeadline: v.string(),
    heroDescription: v.string(),
    missionHeadline: v.string(),
    missionDescription: v.string(),
    features: v.array(featureValidator),
    faq: v.array(faqValidator),
    downloadHeadline: v.string(),
    downloadDescription: v.string(),
    supportEmail: v.optional(v.string()),
    privacyPolicy: v.optional(v.string()),
    termsOfUse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    if (!args.heroHeadline.trim() || !args.heroDescription.trim()) {
      fail("INVALID_CONTENT", "The hero headline and description are required.");
    }
    if (args.features.length > 24) {
      fail("INVALID_CONTENT", "Keep the feature list to 24 items or fewer.");
    }
    if (args.faq.length > 60) {
      fail("INVALID_CONTENT", "Keep the FAQ to 60 entries or fewer.");
    }
    for (const f of args.features) {
      if (!f.title.trim()) {
        fail("INVALID_CONTENT", "Every feature needs a title.");
      }
    }
    for (const entry of args.faq) {
      if (!entry.question.trim() || !entry.answer.trim()) {
        fail(
          "INVALID_CONTENT",
          "Every FAQ entry needs both a question and an answer.",
        );
      }
    }
    const supportEmail = args.supportEmail
      ? cleanEmail(args.supportEmail)
      : undefined;
    if (supportEmail && !isValidEmail(supportEmail)) {
      fail("INVALID_EMAIL", "That support email address does not look correct.");
    }

    const now = Date.now();
    const existing = await getOrCreateContent(ctx);
    const next = {
      heroHeadline: clamp(args.heroHeadline, 200, existing.heroHeadline),
      heroDescription: clamp(
        args.heroDescription,
        1200,
        existing.heroDescription,
      ),
      missionHeadline: clamp(args.missionHeadline, 200, existing.missionHeadline),
      missionDescription: clamp(
        args.missionDescription,
        2000,
        existing.missionDescription,
      ),
      features: args.features.map((f) => ({
        id: cleanText(f.id, 60) || crypto.randomUUID(),
        title: clamp(f.title, 140),
        description: clamp(f.description, 600),
      })),
      faq: args.faq.map((entry) => ({
        id: cleanText(entry.id, 60) || crypto.randomUUID(),
        question: clamp(entry.question, 200),
        answer: clamp(entry.answer, 1200),
      })),
      downloadHeadline: clamp(
        args.downloadHeadline,
        200,
        existing.downloadHeadline,
      ),
      downloadDescription: clamp(
        args.downloadDescription,
        800,
        existing.downloadDescription,
      ),
      supportEmail: supportEmail || undefined,
      privacyPolicy: clampOptional(args.privacyPolicy, LIMITS.description),
      termsOfUse: clampOptional(args.termsOfUse, LIMITS.description),
      updatedAt: now,
      updatedBy: admin._id,
    };

    await ctx.db.patch(existing._id, next);
    await logActivity(ctx, admin, {
      action: "content.updated",
      targetType: "siteContent",
      targetId: existing._id,
    });
    return { ok: true as const };
  },
});

/* ------------------------------------------------------------------ */
/*  Admin: settings + maintenance mode                                 */
/* ------------------------------------------------------------------ */

export const adminGetSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    return (
      settings ?? {
        maintenanceEnabled: false,
        maintenanceMessage: "",
        maintenanceReopenAt: undefined,
        blockDownloadsDuringMaintenance: false,
        siteName: "Jonaki",
        retentionDays: 0,
      }
    );
  },
});

export const adminUpdateSettings = mutation({
  args: {
    siteName: v.string(),
    retentionDays: v.number(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const siteName = clamp(args.siteName, 80);
    if (!siteName) fail("INVALID_SETTINGS", "The site name cannot be empty.");
    const retentionDays = Math.max(0, Math.min(3650, args.retentionDays | 0));

    const existing = await getOrCreateSettings(ctx);
    await ctx.db.patch(existing._id, {
      siteName,
      retentionDays,
      updatedAt: Date.now(),
      updatedBy: admin._id,
    });
    await logActivity(ctx, admin, {
      action: "settings.updated",
      targetType: "siteSettings",
      targetId: existing._id,
      detail: `siteName=${siteName}, retentionDays=${retentionDays}`,
    });
    return { ok: true as const };
  },
});

export const adminUpdateMaintenance = mutation({
  args: {
    enabled: v.boolean(),
    message: v.string(),
    reopenAt: v.optional(v.number()),
    blockDownloads: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const message = clamp(
      args.message,
      LIMITS.maintenanceMessage,
      "We are performing maintenance. Please check back shortly.",
    );

    const existing = await getOrCreateSettings(ctx);
    await ctx.db.patch(existing._id, {
      maintenanceEnabled: args.enabled,
      maintenanceMessage: message,
      maintenanceReopenAt: args.reopenAt ?? undefined,
      blockDownloadsDuringMaintenance: args.blockDownloads,
      updatedAt: Date.now(),
      updatedBy: admin._id,
    });
    await logActivity(ctx, admin, {
      action: args.enabled
        ? "maintenance.enabled"
        : "maintenance.disabled",
      targetType: "siteSettings",
      targetId: existing._id,
      detail: args.enabled
        ? `blockDownloads=${args.blockDownloads}`
        : "maintenance off",
    });
    return { ok: true as const };
  },
});

/* ------------------------------------------------------------------ */
/*  Admin: activity logs                                               */
/* ------------------------------------------------------------------ */

export const adminListLogs = query({
  args: {
    limit: v.optional(v.number()),
    action: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.max(1, Math.min(400, args.limit ?? 120));
    const rows = await ctx.db
      .query("activityLogs")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    const filtered = args.action
      ? rows.filter((r) => r.action.startsWith(args.action as string))
      : rows;
    return filtered.map((r) => ({
      _id: r._id,
      actorEmail: r.actorEmail ?? null,
      action: r.action,
      targetType: r.targetType ?? null,
      targetId: r.targetId ?? null,
      detail: r.detail ?? null,
      createdAt: r.createdAt,
    }));
  },
});

/* ------------------------------------------------------------------ */
/*  Admin: dashboard overview (real counts from real records)          */
/* ------------------------------------------------------------------ */

export const adminOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [bugs, suggestions, messages, logs] = await Promise.all([
      ctx.db.query("bugReports").withIndex("by_createdAt").take(1000),
      ctx.db.query("featureSuggestions").withIndex("by_createdAt").take(1000),
      ctx.db.query("contactMessages").withIndex("by_createdAt").take(1000),
      ctx.db.query("activityLogs").withIndex("by_createdAt").order("desc").take(12),
    ]);

    const published = await ctx.db
      .query("appReleases")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .first();

    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();

    return {
      bugTotal: bugs.length,
      bugNew: bugs.filter((b) => b.status === "new").length,
      bugOpen: bugs.filter(
        (b) => b.status === "new" || b.status === "under-review" || b.status === "in-progress",
      ).length,
      suggestionOpen: suggestions.filter(
        (s) =>
          s.status === "new" ||
          s.status === "under-review" ||
          s.status === "planned" ||
          s.status === "in-progress",
      ).length,
      suggestionTotal: suggestions.length,
      messageUnread: messages.filter((m) => m.status === "unread").length,
      messageTotal: messages.length,
      currentVersion: published?.version ?? null,
      currentReleaseDate: published?.releaseDate ?? null,
      maintenanceEnabled: settings?.maintenanceEnabled ?? false,
      recentActivity: logs.map((r) => ({
        actorEmail: r.actorEmail ?? null,
        action: r.action,
        detail: r.detail ?? null,
        createdAt: r.createdAt,
      })),
    };
  },
});

/* ------------------------------------------------------------------ */
/*  Admin: data retention (purge old feedback/messages)                */
/* ------------------------------------------------------------------ */

export const adminPurgeOldData = mutation({
  args: { olderThanDays: v.number() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const days = Math.max(1, Math.min(3650, args.olderThanDays | 0));
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    let purged = 0;
    for (const table of ["bugReports", "featureSuggestions", "contactMessages"] as const) {
      const rows = await ctx.db
        .query(table)
        .withIndex("by_createdAt", (q) => q.lt("createdAt", cutoff))
        .collect();
      for (const row of rows) {
        await ctx.db.delete(row._id);
        purged++;
      }
    }

    await logActivity(ctx, admin, {
      action: "data.purged",
      targetType: "siteSettings",
      detail: `Purged ${purged} record(s) older than ${days} days.`,
    });
    return { purged };
  },
});
