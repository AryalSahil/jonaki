import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

import type { Doc, MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Error helpers. Public clients only ever see `code` + user-safe `message`;
 * internal error traces are never returned to visitors.
 */
export function fail(code: string, message: string): never {
  throw new ConvexError({ code, message });
}

export function unauthorized(): never {
  fail("UNAUTHORIZED", "You must be signed in to do that.");
}

export function forbidden(): never {
  fail("FORBIDDEN", "Administrator access is required for this action.");
}

/** Extract the safe { code, message } payload from a ConvexError on the client. */
export function errorInfo(error: unknown): { code: string; message: string } {
  if (error instanceof ConvexError) {
    const data = error.data;
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
    ) {
      return {
        code: String((data as { code?: unknown }).code ?? "ERROR"),
        message: (data as { message: string }).message,
      };
    }
    return { code: "ERROR", message: String(data) };
  }
  return {
    code: "ERROR",
    message: "Something went wrong. Please try again in a moment.",
  };
}

/**
 * Resolve the signed-in user or null. Used by public queries that adapt their
 * response for admins (e.g. bypassing maintenance mode in the client shell).
 */
export async function currentUserOrNull(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db.get(userId);
}

/**
 * Guard for every admin API route: requires a signed-in user whose database
 * record carries the admin role. Hiding admin buttons in the frontend is not
 * authorization — this is.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) unauthorized();
  const user = await ctx.db.get(userId);
  if (!user) unauthorized();
  if (user.role !== "admin") forbidden();
  return user;
}

/** Append an entry to the activity log. Never log secrets or session data. */
export async function logActivity(
  ctx: MutationCtx,
  actor: Pick<Doc<"users">, "_id" | "email"> | null,
  entry: {
    action: string;
    targetType?: string;
    targetId?: string;
    detail?: string;
  },
) {
  await ctx.db.insert("activityLogs", {
    actorId: actor?._id,
    actorEmail: actor?.email,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    detail: entry.detail,
    createdAt: Date.now(),
  });
}
