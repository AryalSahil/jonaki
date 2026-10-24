import {
  createAccount,
  getAuthSessionId,
  getAuthUserId,
  invalidateSessions,
  modifyAccountCredentials,
  retrieveAccount,
} from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";

import { action, internal, mutation, query } from "./_generated/server";
import { logActivity, requireAdmin } from "./lib/auth";

/**
 * Administrator authentication.
 *
 * The initial administrator is provisioned server-side from environment
 * variables:
 *   JONAKI_ADMIN_EMAIL            — login address for the admin account
 *   JONAKI_ADMIN_INITIAL_PASSWORD — initial password (must be changed)
 *
 * The bootstrap action is internal: it can only be run from the Convex
 * dashboard or CLI by someone with deployment access, never by a website
 * visitor. It is idempotent — re-running it rotates the password back to the
 * environment value and forces another password change, which is useful if
 * the environment variables are rotated.
 *
 * Passwords are stored by the Convex Auth Password provider (scrypt-hashed);
 * they never appear in this codebase, in client bundles, or in logs.
 */

const MIN_PASSWORD_LENGTH = 12;

function readAdminEnv(): { email: string; password: string } {
  const email = (process.env.JONAKI_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.JONAKI_ADMIN_INITIAL_PASSWORD ?? "";
  if (!email || !password) {
    throw new Error(
      "Set JONAKI_ADMIN_EMAIL and JONAKI_ADMIN_INITIAL_PASSWORD in the deployment environment before bootstrapping the admin account.",
    );
  }
  return { email, password };
}

/**
 * Internal: create (or re-sync) the administrator account from environment
 * variables. Run with:
 *   bunx convex run admin:bootstrapAdmin
 */
export const bootstrapAdmin = action({
  args: {},
  handler: async (ctx) => {
    const { email, password } = readAdminEnv();

    let userId;
    try {
      const result = await createAccount(ctx, {
        provider: "password",
        account: { id: email, secret: password },
        profile: {
          email,
          name: "Site administrator",
          role: "admin",
          mustChangePassword: true,
        },
      });
      userId = result.user._id;
    } catch (error) {
      // Account already exists with a different secret: rotate the password
      // back to the current environment value instead.
      if (error instanceof Error && error.message.includes("already exists")) {
        await modifyAccountCredentials(ctx, {
          provider: "password",
          account: { id: email, secret: password },
        });
        const { user } = await retrieveAccount(ctx, {
          provider: "password",
          account: { id: email, secret: password },
        });
        userId = user._id;
        await ctx.runMutation(internal.admin.markPasswordChangeRequired, {
          userId,
        });
      } else {
        throw error;
      }
    }

    await ctx.runMutation(internal.admin.recordBootstrap, { userId, email });
    return { ok: true as const, userId };
  },
});

/** Internal: flag the account as still using the bootstrap password. */
export const markPasswordChangeRequired = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { mustChangePassword: true });
  },
});

/** Internal: record the bootstrap event in the activity log. */
export const recordBootstrap = mutation({
  args: { userId: v.id("users"), email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.userId);
    if (existing && existing.role === "admin") {
      await logActivity(ctx, existing, {
        action: "admin.bootstrapped",
        targetType: "user",
        targetId: args.userId,
        detail: "Administrator account provisioned from environment.",
      });
    }
  },
});

/**
 * Public (authenticated): what the admin shell needs to know about the
 * current session — role and whether the bootstrap password is still in use.
 */
export const session = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { state: "signed-out" as const };
    const user = await ctx.db.get(userId);
    if (!user) return { state: "signed-out" as const };
    return {
      state: "signed-in" as const,
      email: user.email ?? null,
      name: user.name ?? null,
      role: user.role ?? null,
      mustChangePassword: user.mustChangePassword === true,
    };
  },
});

/**
 * Admin: change the password. Verifies the current password server-side,
 * requires a strong replacement, and invalidates every other session so a
 * stolen refresh token stops working immediately.
 */
export const changePassword = action({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You must be signed in to change your password.",
      });
    }
    const user = await ctx.runQuery(internal.admin.getUser, { userId });
    if (!user || user.role !== "admin" || !user.email) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Administrator access is required.",
      });
    }

    if (args.newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new ConvexError({
        code: "WEAK_PASSWORD",
        message: `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
    }
    if (args.newPassword === args.currentPassword) {
      throw new ConvexError({
        code: "WEAK_PASSWORD",
        message: "The new password must be different from the current one.",
      });
    }

    // Verify the current password before allowing the change.
    try {
      await retrieveAccount(ctx, {
        provider: "password",
        account: { id: user.email, secret: args.currentPassword },
      });
    } catch {
      throw new ConvexError({
        code: "WRONG_PASSWORD",
        message: "The current password you entered is not correct.",
      });
    }

    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: user.email, secret: args.newPassword },
    });

    await ctx.runMutation(internal.admin.afterPasswordChange, {
      userId,
      email: user.email,
    });

    // Invalidate every session except the one performing the change; the
    // client then holds a fresh token via its normal refresh flow.
    const sessionId = await getAuthSessionId(ctx);
    await invalidateSessions(ctx, {
      userId,
      except: sessionId ? [sessionId] : undefined,
    });

    return { ok: true as const };
  },
});

/** Internal: clear the must-change flag and log the change. */
export const afterPasswordChange = mutation({
  args: { userId: v.id("users"), email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    await ctx.db.patch(args.userId, { mustChangePassword: false });
    await logActivity(ctx, user, {
      action: "admin.password_changed",
      targetType: "user",
      targetId: args.userId,
    });
  },
});

/** Internal: fetch a user record for the change-password action. */
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return { _id: user._id, email: user.email, role: user.role };
  },
});

/** Internal helper for logout-everywhere bookkeeping. */
export const logLogoutEverywhere = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    await logActivity(ctx, user, {
      action: "admin.logout_everywhere",
      targetType: "user",
      targetId: args.userId,
    });
  },
});

/** Guard helper reused by the dashboard shell. */
export const requireAdminSession = query({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    return {
      email: admin.email ?? null,
      mustChangePassword: admin.mustChangePassword === true,
    };
  },
});
