import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { LIMITS } from "./constants";
import { cleanText } from "./spam";

/**
 * Singleton accessors for site settings and site content, with sane defaults
 * so the public site renders correctly before an admin ever saves anything.
 */

export const DEFAULT_SETTINGS: Omit<
  Doc<"siteSettings">,
  "_id" | "_creationTime"
> = {
  key: "main",
  maintenanceEnabled: false,
  maintenanceMessage:
    "Jonaki is briefly offline for maintenance. Please check back a little later.",
  maintenanceReopenAt: undefined,
  blockDownloadsDuringMaintenance: false,
  siteName: "Jonaki",
  retentionDays: 0,
  updatedAt: 0,
  updatedBy: undefined,
};

export const DEFAULT_CONTENT: Omit<Doc<"siteContent">, "_id" | "_creationTime"> =
  {
    key: "main",
    heroHeadline: "Walk with more confidence. Let your phone speak.",
    heroDescription:
      "Jonaki is a voice-first walking assistant designed to help blind and visually impaired people identify supported obstacles and receive spoken alerts using their smartphone.",
    missionHeadline: "Technology that helps make every step count.",
    missionDescription:
      "Navigating busy streets, crowded sidewalks, and unfamiliar places takes attention and care. Jonaki adds a voice-first layer of support: it looks at what the phone camera can see, names supported obstacles out loud, and can quietly buzz to reinforce an alert — so you can keep your attention on the walk itself.",
    features: [],
    faq: [],
    downloadHeadline: "Meet your new walking companion.",
    downloadDescription:
      "Get Jonaki for Android and explore voice-first walking assistance.",
    supportEmail: undefined,
    privacyPolicy: undefined,
    termsOfUse: undefined,
    updatedAt: 0,
    updatedBy: undefined,
  };

export async function getSettings(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"siteSettings"> | null> {
  return await ctx.db
    .query("siteSettings")
    .withIndex("by_key", (q) => q.eq("key", "main"))
    .unique();
}

export async function getOrCreateSettings(
  ctx: MutationCtx,
): Promise<Doc<"siteSettings">> {
  const existing = await getSettings(ctx);
  if (existing) return existing;
  const id = await ctx.db.insert("siteSettings", { ...DEFAULT_SETTINGS });
  return (await ctx.db.get(id))!;
}

export async function getContent(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"siteContent"> | null> {
  return await ctx.db
    .query("siteContent")
    .withIndex("by_key", (q) => q.eq("key", "main"))
    .unique();
}

export async function getOrCreateContent(
  ctx: MutationCtx,
): Promise<Doc<"siteContent">> {
  const existing = await getContent(ctx);
  if (existing) return existing;
  const id = await ctx.db.insert("siteContent", DEFAULT_CONTENT);
  return (await ctx.db.get(id))!;
}

/** Clamp admin-entered text to the documented limits. */
export function clamp(value: unknown, max: number, fallback = ""): string {
  return cleanText(value, max) || fallback;
}

export function clampOptional(value: unknown, max: number): string | undefined {
  const text = cleanText(value, max);
  return text.length > 0 ? text : undefined;
}

export const CONTENT_LIMITS = LIMITS;
