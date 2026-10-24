import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * Public APK download endpoint.
 *
 * Serves exactly one file: the currently published release. It re-checks, on
 * every request, that (a) a release is published and (b) maintenance mode is
 * not blocking downloads. It never exposes storage credentials or URLs — it
 * streams the stored binary directly, with the correct Android package MIME
 * type and a descriptive filename, so Android's downloader and Play Protect
 * see a real APK rather than an HTML error page.
 *
 * Convex answers HEAD requests by running this GET handler and stripping the
 * body, so availability probes work without a separate route.
 */
export const downloadApk = httpAction(async (ctx, request) => {
  const info = await ctx.runQuery(internal.download.releaseForDownload, {});

  if (info.kind === "maintenance") {
    return json(
      {
        error: "maintenance",
        message: info.message,
      },
      503,
      { "Retry-After": "120" },
    );
  }
  if (info.kind === "none") {
    return json(
      {
        error: "not_published",
        message:
          "No Jonaki APK has been published yet. Nothing was downloaded.",
      },
      404,
    );
  }

  const blob = await ctx.storage.get(info.storageId as never);
  if (!blob) {
    return json(
      {
        error: "missing_file",
        message:
          "The published APK file is temporarily unavailable. Nothing was downloaded.",
      },
      404,
    );
  }

  // Count the download (best-effort; never blocks the download itself).
  try {
    await ctx.runMutation(internal.download.recordDownloadPublic, {
      id: info.releaseId,
    });
  } catch {
    /* counting is non-critical */
  }

  const filename = `Jonaki-Android-v${info.version}.apk`;
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/vnd.android.package-archive",
    "Content-Length": String(blob.size),
    "Content-Disposition": `attachment; filename="${filename}"`,
    // Encourage a fresh check every time rather than a cached copy.
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  };

  // Range support so Android's downloader can resume interrupted transfers.
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (match) {
      const start = match[1] ? parseInt(match[1], 10) : 0;
      const end = match[2] ? parseInt(match[2], 10) : blob.size - 1;
      if (
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        start >= 0 &&
        end >= start &&
        start < blob.size
      ) {
        const safeEnd = Math.min(end, blob.size - 1);
        const slice = blob.slice(start, safeEnd + 1);
        return new Response(slice, {
          status: 206,
          headers: {
            ...baseHeaders,
            "Content-Range": `bytes ${start}-${safeEnd}/${blob.size}`,
            "Content-Length": String(slice.size),
          },
        });
      }
    }
  }

  return new Response(blob, { status: 200, headers: baseHeaders });
});

function json(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

http.route({
  path: "/download/latest.apk",
  method: "GET",
  handler: downloadApk,
});

/**
 * Health check. Always allowed, even during maintenance, so uptime monitors
 * and deployment checks keep working. Reveals nothing private.
 */
export const health = httpAction(async () => {
  return json({ ok: true }, 200);
});

http.route({
  path: "/health",
  method: "GET",
  handler: health,
});

export default http;
