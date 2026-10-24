// Existing providers are unchanged. The Password provider below was added so
// the site owner's administrators can sign in to /admin/login with the
// credentials provisioned server-side (see convex/admin.ts). Public
// self-service password sign-up is disabled in the profile callback.

import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";
import { emailOtp } from "./auth/emailOtp";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    emailOtp,
    Anonymous,
    Password({
      id: "password",
      profile(params) {
        const { flow, email } = params as { flow?: string; email?: unknown };
        // Only provisioned administrators may hold a password account. The
        // initial admin is created server-side (bootstrap action), never by a
        // browser sign-up attempt.
        if (flow === "signUp") {
          throw new Error(
            "Direct sign-up is disabled. Administrator accounts are provisioned by the site owner.",
          );
        }
        return { email: String(email ?? "").trim().toLowerCase() };
      },
    }),
  ],
  signIn: {
    // Login rate limiting / temporary lockout for repeated failures.
    maxFailedAttempsPerHour: 5,
  },
});
