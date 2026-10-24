import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";
import { getSettings } from "./lib/settings";

/**
 * Internal helpers used only by the download HTTP action. None of these are
 * publicly callable — they exist so the HTTP route can read publication state
 * and count downloads without exposing anything to visitors.
 */

/** Resolve the release the public download endpoint should serve. */
export const releaseForDownload = internalQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await getSettings(ctx);
    if (
      settings?.maintenanceEnabled &&
      settings.blockDownloadsDuringMaintenance
    ) {
      return {
        kind: "maintenance" as const,
        message: settings.maintenanceMessage,
      };
    }

    const release = await ctx.db
      .query("appReleases")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .first();

    if (!release || !release.storageId) {
      return { kind: "none" as const };
    }

    return {
      kind: "ok" as const,
      storageId: release.storageId,
      version: release.version,
      releaseId: release._id,
    };
  },
});

/** Increment the download counter (called by the HTTP action). */
export const recordDownloadPublic = internalMutation({
  args: { id: v.id("appReleases") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return;
    await ctx.db.patch(args.id, { downloadCount: doc.downloadCount + 1 });
  },
});
