import { ConvexError } from "convex/values";

/**
 * Display labels for the backend enums in src/convex/lib/constants.ts. The
 * admin UI and public forms read these instead of showing raw slugs.
 */

export const BUG_CATEGORY_LABELS: Record<string, string> = {
  "app-crash": "App crash",
  "ai-detection": "AI object detection",
  voice: "Voice guidance",
  vibration: "Vibration feedback",
  navigation: "Navigation",
  "apk-installation": "APK installation",
  website: "This website",
  other: "Something else",
};

export const SUGGESTION_CATEGORY_LABELS: Record<string, string> = {
  accessibility: "Accessibility",
  "voice-commands": "Voice commands",
  languages: "Languages",
  "ai-detection": "AI object detection",
  navigation: "Navigation",
  emergency: "Emergency features",
  other: "Something else",
};

export const CONTACT_CATEGORY_LABELS: Record<string, string> = {
  general: "General question",
  "technical-support": "Technical support",
  "accessibility-feedback": "Accessibility feedback",
  partnership: "Partnership",
  other: "Something else",
};

export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  "under-review": "Under review",
  "in-progress": "In progress",
  resolved: "Resolved",
  closed: "Closed",
  planned: "Planned",
  completed: "Completed",
  declined: "Declined",
  unread: "Unread",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
  draft: "Draft",
  published: "Published",
  unpublished: "Unpublished",
};

export function label(map: Record<string, string>, value: string): string {
  return map[value] ?? value;
}

/**
 * Client-side counterpart of `errorInfo` in the backend: pull the user-safe
 * message out of a ConvexError without importing server-only modules.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    const data = error.data as unknown;
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
    if (typeof data === "string") return data;
  }
  return "Something went wrong. Please try again in a moment.";
}
