import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { LIMITS } from "./lib/constants";
import { fail, logActivity, requireAdmin } from "./lib/auth";
import { getSettings } from "./lib/settings";

/**
 * APK release management.
 *
 * Storage model: the binary lives in private Convex file storage. The public
 * site never receives a storage URL — it receives verified metadata plus a
 * stable download endpoint (`/download/latest.apk`) served by an HTTP action
 * that re-checks publication state and maintenance settings on every request.
 *
 * Publishing a release is a single mutation, so "make this the current
 * version" and "retire the previous one" happen atomically.
 */

const ALLOWED_APK_CONTENT_TYPES = [
  "application/vnd.android.package-archive",
  "application/octet-stream",
  "application/zip",
  "application/x-zip-compressed",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Public: metadata for the currently published release. Returns null while no
 * release has been published — the site shows an honest "not published yet"
 * state instead of a fake download.
 */
export const currentPublished = query({
  args: {},
  handler: async (ctx) => {
    const release = await ctx.db
      .query("appReleases")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .first();

    const settings = await getSettings(ctx);
    const maintenance =
      settings !== null && settings.maintenanceEnabled
        ? {
            message: settings.maintenanceMessage,
            reopenAt: settings.maintenanceReopenAt ?? null,
            downloadsBlocked: settings.blockDownloadsDuringMaintenance,
          }
        : null;

    if (!release) {
      return {
        release: null as null,
        maintenance,
        siteName: settings?.siteName ?? "Jonaki",
      };
    }

    return {
      release: {
        version: release.version,
        fileName: release.fileName,
        fileSizeBytes: release.fileSizeBytes,
        fileSizeLabel: formatBytes(release.fileSizeBytes),
        minAndroid: release.minAndroid ?? null,
        releaseDate: release.releaseDate,
        releaseNotes: release.releaseNotes ?? null,
        // Only surface a checksum that was actually calculated and verified
        // against the stored file.
        sha256: release.checksumVerified ? release.sha256 : null,
        publishedAt: release.publishedAt ?? null,
        downloadUrl: "/download/latest.apk",
      },
      maintenance,
      siteName: settings?.siteName ?? "Jonaki",
    };
  },
});

/** Public: previous releases, newest first (metadata only). */
export const releaseHistory = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("appReleases")
      .withIndex("by_createdAt")
      .order("desc")
      .take(20);
    return rows
      .filter((r) => r.status !== "draft")
      .map((r) => ({
        version: r.version,
        releaseDate: r.releaseDate,
        fileSizeLabel: formatBytes(r.fileSizeBytes),
        minAndroid: r.minAndroid ?? null,
        status: r.status,
        publishedAt: r.publishedAt ?? null,
      }));
  },
});

/** Admin: all releases including drafts, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("appReleases")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
    return rows.map((r) => ({
      _id: r._id,
      version: r.version,
      fileName: r.fileName,
      fileSizeBytes: r.fileSizeBytes,
      fileSizeLabel: formatBytes(r.fileSizeBytes),
      minAndroid: r.minAndroid ?? null,
      releaseDate: r.releaseDate,
      releaseNotes: r.releaseNotes ?? null,
      sha256: r.sha256,
      checksumVerified: r.checksumVerified,
      status: r.status,
      apkStructureOk: r.apkStructureOk,
      apkValidationNotes: r.apkValidationNotes,
      uploadedByEmail: r.uploadedByEmail ?? null,
      createdAt: r.createdAt,
      publishedAt: r.publishedAt ?? null,
      downloadCount: r.downloadCount,
    }));
  },
});

/**
 * Admin: first step of upload. Returns a short-lived upload URL issued by Convex
 * storage. The binary goes straight from the browser to storage; the admin
 * dashboard never touches storage credentials.
 */
export const createUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    const url = await ctx.storage.generateUploadUrl();
    await logActivity(ctx, admin, {
      action: "release.upload_url_created",
      targetType: "appRelease",
    });
    return url;
  },
});

/**
 * Admin: register an uploaded file as a draft release. Validates the file's
 * extension, MIME type, size and APK (ZIP) structure, and records the
 * server-side SHA-256. Publishing is a separate, explicit step so the admin
 * can preview release information first.
 */
export const registerUpload = mutation({
  args: {
    storageId: v.string(),
    version: v.string(),
    fileName: v.string(),
    minAndroid: v.optional(v.string()),
    releaseDate: v.string(),
    releaseNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const version = args.version.trim();
    if (!/^[0-9]+\.[0-9]+\.[0-9]+([-.][0-9A-Za-z.-]+)?$/.test(version)) {
      fail(
        "INVALID_VERSION",
        "Version must look like 1.0.0 (semantic versioning).",
      );
    }

    const fileName = args.fileName.trim();
    if (!fileName.toLowerCase().endsWith(".apk")) {
      fail("INVALID_EXTENSION", "Only .apk files can be uploaded.");
    }

    const metadata = await ctx.db.system.get(
      args.storageId as Parameters<QueryCtx["db"]["system"]["get"]>[0],
    );
    if (!metadata) {
      fail("UPLOAD_NOT_FOUND", "The uploaded file could not be found.");
    }

    const size = (metadata as { size?: number }).size ?? 0;
    if (size <= 0) {
      fail("EMPTY_FILE", "The uploaded file is empty.");
    }
    if (size > LIMITS.maxApkBytes) {
      fail(
        "FILE_TOO_LARGE",
        `APK files must be ${formatBytes(LIMITS.maxApkBytes)} or smaller.`,
      );
    }

    const contentType = String(
      (metadata as { contentType?: string }).contentType ?? "",
    ).toLowerCase();
    if (
      contentType &&
      !ALLOWED_APK_CONTENT_TYPES.some((allowed) =>
        contentType.includes(allowed),
      )
    ) {
      fail(
        "INVALID_MIME_TYPE",
        `The server received "${contentType}", which is not an Android package. Re-select the .apk file and try again.`,
      );
    }

    const sha256 = String((metadata as { sha256?: string }).sha256 ?? "");
    if (!sha256) {
      fail(
        "CHECKSUM_UNAVAILABLE",
        "The server could not calculate a checksum for this file, so it cannot be published. Please upload the file again.",
      );
    }

    // Structure check: read the file and confirm it is a ZIP containing an
    // AndroidManifest.xml entry. Done here (not client-side) so the result is
    // trustworthy.
    const apkStructure = await verifyApkStructure(ctx, args.storageId);

    const id = await ctx.db.insert("appReleases", {
      version,
      fileName: `Jonaki-Android-v${version}.apk`,
      fileSizeBytes: size,
      minAndroid: args.minAndroid?.trim() || undefined,
      releaseDate: args.releaseDate.trim(),
      releaseNotes: args.releaseNotes?.trim() || undefined,
      sha256,
      checksumVerified: sha256.length === 64,
      storageId: args.storageId,
      status: "draft",
      apkStructureOk: apkStructure.ok,
      apkValidationNotes: apkStructure.notes,
      uploadedBy: admin._id,
      uploadedByEmail: admin.email,
      createdAt: Date.now(),
      downloadCount: 0,
    });

    await logActivity(ctx, admin, {
      action: "release.uploaded",
      targetType: "appRelease",
      targetId: id,
      detail: `${version} (${formatBytes(size)})${apkStructure.ok ? "" : " — structure warnings"}`,
    });

    const doc = (await ctx.db.get(id))!;
    return {
      _id: doc._id,
      version: doc.version,
      fileName: doc.fileName,
      fileSizeLabel: formatBytes(doc.fileSizeBytes),
      minAndroid: doc.minAndroid ?? null,
      releaseDate: doc.releaseDate,
      releaseNotes: doc.releaseNotes ?? null,
      sha256: doc.sha256,
      checksumVerified: doc.checksumVerified,
      status: doc.status,
      apkStructureOk: doc.apkStructureOk,
      apkValidationNotes: doc.apkValidationNotes,
      createdAt: doc.createdAt,
    };
  },
});

/**
 * Read enough of the stored file to confirm it is an APK: ZIP magic bytes at
 * the start, and an AndroidManifest.xml entry name in the central directory
 * near the end. Returns warnings rather than throwing — the admin sees them in
 * the preview before publishing.
 */
async function verifyApkStructure(
  ctx: { storage: { get(id: never): Promise<Blob | null> } },
  storageId: string,
): Promise<{ ok: boolean; notes: string[] }> {
  const notes: string[] = [];
  try {
    const blob = await ctx.storage.get(storageId as never);
    if (!blob) {
      return { ok: false, notes: ["Stored file could not be read."] };
    }

    const head = new Uint8Array(
      await blob.slice(0, 4).arrayBuffer(),
    );
    const isZip =
      head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04;
    if (!isZip) {
      notes.push("File does not start with ZIP magic bytes.");
      return { ok: false, notes };
    }

    // Look for the manifest entry name in the last 256 KB (central directory).
    const tailStart = Math.max(0, blob.size - 256 * 1024);
    const tail = new Uint8Array(await blob.slice(tailStart).arrayBuffer());
    const tailText = new TextDecoder("latin1").decode(tail);
    if (!tailText.includes("AndroidManifest.xml")) {
      notes.push("No AndroidManifest.xml entry found in the ZIP directory.");
      return { ok: false, notes };
    }

    notes.push("ZIP container and AndroidManifest.xml entry verified.");
    return { ok: true, notes };
  } catch (error) {
    notes.push(
      `Structure check failed: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    return { ok: false, notes };
  }
}

/** Admin: preview a single release before publishing. */
export const get = query({
  args: { id: v.id("appReleases") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    return {
      _id: doc._id,
      version: doc.version,
      fileName: doc.fileName,
      fileSizeLabel: formatBytes(doc.fileSizeBytes),
      minAndroid: doc.minAndroid ?? null,
      releaseDate: doc.releaseDate,
      releaseNotes: doc.releaseNotes ?? null,
      sha256: doc.sha256,
      checksumVerified: doc.checksumVerified,
      status: doc.status,
      apkStructureOk: doc.apkStructureOk,
      apkValidationNotes: doc.apkValidationNotes,
      uploadedByEmail: doc.uploadedByEmail ?? null,
      createdAt: doc.createdAt,
      publishedAt: doc.publishedAt ?? null,
      downloadCount: doc.downloadCount,
    };
  },
});

/**
 * Admin: publish a release as the current version. Any previously published
 * release is retired in the same transaction, so the public endpoint always
 * resolves to exactly one current version.
 */
export const publish = mutation({
  args: { id: v.id("appReleases") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) fail("NOT_FOUND", "That release no longer exists.");
    if (doc.status === "published") {
      fail("ALREADY_PUBLISHED", "That release is already the current version.");
    }
    if (!doc.apkStructureOk) {
      fail(
        "INVALID_APK",
        "This file did not pass the APK structure check, so it cannot be published. Upload the correct signed release build.",
      );
    }

    const now = Date.now();
    const previous = await ctx.db
      .query("appReleases")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    for (const old of previous) {
      await ctx.db.patch(old._id, {
        status: "unpublished",
        unpublishedAt: now,
      });
    }

    await ctx.db.patch(args.id, { status: "published", publishedAt: now });

    await logActivity(ctx, admin, {
      action: "release.published",
      targetType: "appRelease",
      targetId: args.id,
      detail: `Version ${doc.version} is now the current release.`,
    });
  },
});

/** Admin: unpublish (retire) a release without deleting it. */
export const unpublish = mutation({
  args: { id: v.id("appReleases") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) fail("NOT_FOUND", "That release no longer exists.");
    await ctx.db.patch(args.id, {
      status: "unpublished",
      unpublishedAt: Date.now(),
    });
    await logActivity(ctx, admin, {
      action: "release.unpublished",
      targetType: "appRelease",
      targetId: args.id,
      detail: `Version ${doc.version} retired.`,
    });
  },
});

/** Admin: delete a release record and its stored binary. */
export const remove = mutation({
  args: { id: v.id("appReleases") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) fail("NOT_FOUND", "That release no longer exists.");
    if (doc.status === "published") {
      fail(
        "PUBLISHED",
        "Unpublish this release before deleting it, so the public download never points at a missing file.",
      );
    }
    await ctx.storage.delete(doc.storageId as never);
    await ctx.db.delete(args.id);
    await logActivity(ctx, admin, {
      action: "release.deleted",
      targetType: "appRelease",
      targetId: args.id,
      detail: `Version ${doc.version} deleted.`,
    });
  },
});

/** Internal: called by the download HTTP action to count a completed download. */
export const recordDownload = mutation({
  args: { id: v.id("appReleases") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return;
    await ctx.db.patch(args.id, { downloadCount: doc.downloadCount + 1 });
  },
});


