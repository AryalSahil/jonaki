/**
 * Single source of truth for the Jonaki website.
 *
 * ── Publishing the APK ──────────────────────────────────────────────────
 * 1. Upload the signed release APK to a stable, versioned URL (your own
 *    domain, e.g. /downloads/Jonaki-Android-v1.0.0.apk, or a GitHub Release).
 * 2. Paste that URL into `release.apkUrl` below, or set the environment
 *    variable VITE_JONAKI_APK_URL at build time.
 * 3. Fill in only the release details you can verify (version, size, minimum
 *    Android version, release date, checksum, requirements). Empty fields are
 *    hidden on the site — nothing is invented.
 *
 * While `apkUrl` is empty the site shows a clear "release pending" state and
 * every download button explains that the APK is not published yet. It never
 * links to a placeholder file, a store listing, or a fake success state.
 */
const envApkUrl = (import.meta.env.VITE_JONAKI_APK_URL ?? "").trim();

export type FeatureStatus = "available" | "not-in-release";

export type Feature = {
  icon: "scan" | "volume" | "vibrate" | "mic" | "map" | "lifebuoy";
  title: string;
  description: string;
  status: FeatureStatus;
};

export const site = {
  name: "Jonaki",
  tagline: "A little light in every step.",
  mission:
    "Make everyday mobility more accessible through voice-first technology.",
  description:
    "Jonaki is a voice-first walking assistant for Android that helps blind and visually impaired people notice supported obstacles using the phone camera, concise spoken alerts, and optional vibration feedback.",

  /** Add a real support address before launch, e.g. "hello@jonaki.app". */
  contactEmail: "",

  release: {
    /** Live APK URL. Leave empty until the first public build is uploaded. */
    apkUrl: envApkUrl,
    version: "",
    fileSize: "",
    minAndroid: "",
    releaseDate: "",
    /** Only publish a checksum you generated from the exact build you ship. */
    sha256: "",
    /** Verified device requirements, one per line. */
    requirements: [] as string[],
  },

  legal: {
    /** Link to published documents, or leave empty to show a clear "not yet published" dialog. */
    privacyUrl: "",
    termsUrl: "",
  },
};

export const features: Feature[] = [
  {
    icon: "scan",
    title: "AI-assisted object detection",
    description:
      "Camera obstacle scanning looks for supported visible objects in the path ahead and reports what the model recognises.",
    status: "available",
  },
  {
    icon: "volume",
    title: "Spoken alerts",
    description:
      "When a supported object is detected, Jonaki speaks a concise warning aloud, with spoken guidance and directional audio cues.",
    status: "available",
  },
  {
    icon: "vibrate",
    title: "Vibration feedback",
    description:
      "Haptic alerts and directional warnings accompany detections, for noisy places or when you prefer to keep the speaker quiet.",
    status: "available",
  },
  {
    icon: "mic",
    title: "Voice commands",
    description:
      "Ask about the scene ahead or check the assistant's status hands-free, without reaching for the screen.",
    status: "available",
  },
  {
    icon: "map",
    title: "Navigation assistance",
    description:
      "Pedestrian navigation with turn-by-turn spoken guidance, using GPS and OpenStreetMap map data.",
    status: "available",
  },
  {
    icon: "lifebuoy",
    title: "Emergency assistance",
    description:
      "A dedicated emergency screen with an SOS siren, GPS location sharing, and quick access to your contacts.",
    status: "available",
  },
];

export const releaseFacts = () => {
  const { version, fileSize, minAndroid, releaseDate, requirements, sha256 } =
    site.release;
  const facts = [
    version ? { label: "Application version", value: version } : null,
    fileSize ? { label: "APK file size", value: fileSize } : null,
    minAndroid ? { label: "Android minimum version", value: minAndroid } : null,
    releaseDate ? { label: "Release date", value: releaseDate } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return {
    facts,
    requirements: [...requirements],
    sha256,
  };
};

export const hasContact = () => site.contactEmail.trim().length > 0;
