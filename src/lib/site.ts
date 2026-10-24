import { useEffect, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

/**
 * Public site state: database-backed content, current release metadata, and
 * maintenance status — all from one server query so the shell can switch to
 * the maintenance page without extra round-trips.
 */

export type PublicState = {
  siteName: string;
  supportEmail: string | null;
  maintenance: { message: string; reopenAt: number | null } | null;
  content: {
    heroHeadline: string;
    heroDescription: string;
    missionHeadline: string;
    missionDescription: string;
    features: { id: string; title: string; description: string }[];
    faq: { id: string; question: string; answer: string }[];
    downloadHeadline: string;
    downloadDescription: string;
    privacyPolicy: string | null;
    termsOfUse: string | null;
  };
};

export type ReleaseState = {
  release: {
    version: string;
    fileName: string;
    fileSizeBytes: number;
    fileSizeLabel: string;
    minAndroid: string | null;
    releaseDate: string;
    releaseNotes: string | null;
    sha256: string | null;
    publishedAt: number | null;
    downloadUrl: string;
  } | null;
  maintenance: {
    message: string;
    reopenAt: number | null;
    downloadsBlocked: boolean;
  } | null;
  siteName: string;
};

/** `undefined` while loading, then the resolved state. */
export function usePublicState(): PublicState | undefined {
  return useQuery(api.site.publicState);
}

export function useReleaseState(): ReleaseState | undefined {
  return useQuery(api.releases.currentPublished);
}

/**
 * A per-browser random key, generated once, sent with public submissions so
 * the server can rate-limit without ever storing a raw IP address.
 */
export function useClientKey(): string {
  const [key, setKey] = useState("");
  useEffect(() => {
    let stored = "";
    try {
      stored = window.localStorage.getItem("jonaki-client-key") ?? "";
    } catch {
      /* storage disabled */
    }
    if (!stored) {
      stored = crypto.randomUUID();
      try {
        window.localStorage.setItem("jonaki-client-key", stored);
      } catch {
        /* storage disabled */
      }
    }
    setKey(stored);
  }, []);
  return key;
}

/** Timestamp marking when a form was rendered, for the server's fill-time check. */
export function useRenderedAt(): number {
  const [renderedAt, setRenderedAt] = useState(() => Date.now());
  useEffect(() => {
    setRenderedAt(Date.now());
  }, []);
  return renderedAt;
}

export function formatDate(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(value: number | null | undefined): string {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
