import { useState } from "react";
import {
  ChevronDown,
  Download as DownloadIcon,
  History,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import {
  ApkStatusLine,
  DownloadButton,
  InstallInstructionsLink,
} from "@/components/site/ApkDownload";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { formatDate, usePublicState, useReleaseState } from "@/lib/site";

export function Download() {
  const state = usePublicState();
  const releaseState = useReleaseState();
  const history = useQuery(api.releases.releaseHistory);
  const [notesOpen, setNotesOpen] = useState(false);

  const release = releaseState?.release ?? null;
  const maintenance = releaseState?.maintenance ?? null;

  const facts: { label: string; value: string }[] = release
    ? [
        { label: "Application version", value: release.version },
        { label: "APK file size", value: release.fileSizeLabel },
        ...(release.minAndroid
          ? [
              {
                label: "Android minimum version",
                value: `${release.minAndroid} and above`,
              },
            ]
          : []),
        { label: "Release date", value: formatDate(release.releaseDate) },
      ].filter((fact) => fact.value)
    : [];

  const previous =
    history?.filter((item) => item.status === "unpublished") ?? [];

  return (
    <section
      id="download"
      aria-labelledby="download-heading"
      className="relative overflow-hidden border-y border-white/10 bg-navy text-navy-foreground"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <svg
          className="h-full w-full"
          viewBox="0 0 1200 620"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M-60 520 C 200 430, 330 545, 590 415 S 930 250, 1260 300"
            stroke="var(--gold)"
            strokeOpacity="0.35"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="trail"
          />
          <path
            d="M-60 588 C 260 500, 430 592, 710 470 S 1010 350, 1260 402"
            stroke="#ffffff"
            strokeOpacity="0.13"
            strokeWidth="1"
            strokeLinecap="round"
            className="trail trail-slow"
          />
          <circle
            cx="590"
            cy="415"
            r="2.4"
            fill="var(--gold)"
            className="firefly"
          />
        </svg>
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.07),transparent_70%)]" />
      </div>

      <div className="shell relative py-20 md:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/[0.05]">
            <Smartphone
              className="h-8 w-8 text-navy-foreground/85"
              aria-hidden="true"
            />
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-navy">
              <DownloadIcon className="h-3 w-3" aria-hidden="true" />
            </span>
          </div>

          <p className="eyebrow mt-8 flex items-center justify-center gap-3 text-navy-foreground/70">
            <span
              aria-hidden="true"
              className="inline-block h-px w-8 bg-navy-foreground/25"
            />
            05 — Download
            <span
              aria-hidden="true"
              className="inline-block h-px w-8 bg-navy-foreground/25"
            />
          </p>

          <h2
            id="download-heading"
            className="text-display mt-6 text-[clamp(2.25rem,5.4vw,3.75rem)] text-navy-foreground"
          >
            {state?.content.downloadHeadline || "Meet your new"}{" "}
            <span className="italic">walking companion.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-[0.975rem] leading-7 text-navy-foreground/70 sm:text-base">
            {state?.content.downloadDescription ||
              "Get Jonaki for Android and explore voice-first walking assistance."}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <DownloadButton
              label="Download Jonaki APK"
              variant="inverted"
              className="w-full sm:w-auto"
            />
            <InstallInstructionsLink inverted />
          </div>

          <ApkStatusLine
            inverted
            className="mx-auto mt-5 max-w-md text-navy-foreground/65"
          />
        </Reveal>

        <Reveal className="mx-auto mt-14 max-w-2xl text-left" delay={80}>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-navy-foreground/65">
                Release details
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-navy-foreground/65">
                {release ? "Published" : "Not yet published"}
              </span>
            </div>

            {release ? (
              <>
                <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {facts.map((fact) => (
                    <div
                      key={fact.label}
                      className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3"
                    >
                      <dt className="text-xs text-navy-foreground/65">
                        {fact.label}
                      </dt>
                      <dd className="text-sm font-medium text-navy-foreground">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {release.releaseNotes ? (
                  <div className="mt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setNotesOpen((open) => !open)}
                      aria-expanded={notesOpen}
                      aria-controls="release-notes"
                      className="h-auto min-h-9 justify-between gap-2 px-0 py-1 text-xs font-medium text-navy-foreground/75 hover:bg-transparent hover:text-navy-foreground"
                    >
                      What changed in this release
                      <ChevronDown
                        className={notesOpen ? "h-3.5 w-3.5 rotate-180" : "h-3.5 w-3.5"}
                        aria-hidden="true"
                      />
                    </Button>
                    {notesOpen ? (
                      <p
                        id="release-notes"
                        className="mt-2 whitespace-pre-wrap rounded-md border border-white/10 bg-white/[0.03] p-3.5 text-sm leading-6 text-navy-foreground/70"
                      >
                        {release.releaseNotes}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-4 text-sm leading-6 text-navy-foreground/70">
                Version, APK size, minimum Android version, and release date
                appear here as soon as the site administrator publishes the
                first signed build from the admin dashboard. This page does not
                show release details it cannot verify.
              </p>
            )}

            {release?.sha256 ? (
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="flex items-center gap-1.5 text-xs font-medium text-navy-foreground/75">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  SHA-256 checksum (calculated on the server)
                </p>
                <code className="mt-2 block break-all font-mono text-[0.7rem] leading-5 text-navy-foreground/60">
                  {release.sha256}
                </code>
                <p className="mt-2 text-xs leading-5 text-navy-foreground/65">
                  Compare this value with the file you downloaded using a
                  checksum tool before installing.
                </p>
              </div>
            ) : null}

            {previous.length > 0 ? (
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="flex items-center gap-1.5 text-xs font-medium text-navy-foreground/75">
                  <History className="h-3.5 w-3.5" aria-hidden="true" />
                  Previous releases
                </p>
                <ul className="mt-3 space-y-2">
                  {previous.slice(0, 5).map((item) => (
                    <li
                      key={`${item.version}-${item.releaseDate}`}
                      className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs text-navy-foreground/65"
                    >
                      <span className="font-medium text-navy-foreground/85">
                        v{item.version}
                      </span>
                      <span>
                        {formatDate(item.releaseDate)}
                        {item.minAndroid ? ` · Android ${item.minAndroid}+` : ""}
                        {` · ${item.fileSizeLabel}`}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[0.7rem] leading-5 text-navy-foreground/55">
                  Only the current version is served by the download button.
                  Older builds are kept here for reference and are no longer
                  offered for download.
                </p>
              </div>
            ) : null}

            {maintenance ? (
              <p className="mt-6 rounded-md border border-gold/40 bg-gold/10 p-3.5 text-xs leading-5 text-navy-foreground/80">
                Maintenance mode is currently active. Downloads may be paused —
                the maintenance notice above explains.
              </p>
            ) : null}
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-navy-foreground/65">
            Install only the official release linked from this page. Avoid APK
            copies from unknown sites or forwarded messages.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
