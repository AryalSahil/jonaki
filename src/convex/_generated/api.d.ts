/* eslint-disable */
  /**
   * Generated `api` utility.
   *
   * THIS CODE IS AUTOMATICALLY GENERATED.
   *
   * To regenerate, run `npx convex dev`.
   * @module
   */
  
  import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
  import type * as admin from "../admin.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as contact from "../contact.js";
import type * as download from "../download.js";
import type * as feedback from "../feedback.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_settings from "../lib/settings.js";
import type * as lib_spam from "../lib/spam.js";
import type * as releases from "../releases.js";
import type * as site from "../site.js";
import type * as users from "../users.js";

  /**
   * A utility for referencing Convex functions in your app's API.
   *
   * Usage:
   * ```js
   * const myFunctionReference = api.myModule.myFunction;
   * ```
   */
  declare const fullApi: ApiFromModules<{
    "admin": typeof admin,
"auth/emailOtp": typeof auth_emailOtp,
"auth": typeof auth,
"contact": typeof contact,
"download": typeof download,
"feedback": typeof feedback,
"http": typeof http,
"lib/auth": typeof lib_auth,
"lib/constants": typeof lib_constants,
"lib/settings": typeof lib_settings,
"lib/spam": typeof lib_spam,
"releases": typeof releases,
"site": typeof site,
"users": typeof users,
  }>;
  export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
  export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
  