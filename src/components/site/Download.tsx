import { Download as DownloadIcon, Smartphone } from "lucide-react";

import {
  ApkStatusLine,
  DownloadButton,
  InstallInstructionsLink,
} from "@/components/site/ApkDownload";
import { Reveal } from "@/components/site/Reveal";
import { releaseFacts } from "@/config/site";

export function Download() {
  const { facts, requirements, sha256 } = releaseFacts();

  return (
    <section
      id="download"
      aria-labelledby="download-heading"
      className="relative overflow-hidden bg-navy text-navy-foreground"
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
            Meet your new
            <span className="italic"> walking companion.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-[0.975rem] leading-7 text-navy-foreground/70 sm:text-base">
            Get Jonaki for Android and explore voice-first walking assistance.
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
                {facts.length > 0 ? "Published" : "Not yet published"}
              </span>
            </div>

            {facts.length > 0 ? (
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
            ) : (
              <p className="mt-4 text-sm leading-6 text-navy-foreground/70">
                Version, APK size, minimum Android version, and release date
                will be listed here once the first public build is published.
                This page does not show release details it cannot verify.
              </p>
            )}

            {requirements.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs font-medium text-navy-foreground/75">
                  Device requirements
                </p>
                <ul className="mt-2 space-y-1.5">
                  {requirements.map((requirement) => (
                    <li
                      key={requirement}
                      className="flex gap-2 text-sm leading-6 text-navy-foreground/70"
                    >
                      <span aria-hidden="true" className="text-gold">
                        ·
                      </span>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {sha256 ? (
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-xs font-medium text-navy-foreground/75">
                  SHA-256 checksum
                </p>
                <code className="mt-2 block break-all font-mono text-[0.7rem] leading-5 text-navy-foreground/60">
                  {sha256}
                </code>
                <p className="mt-2 text-xs leading-5 text-navy-foreground/65">
                  Compare this value with the file you downloaded using a
                  checksum tool before installing.
                </p>
              </div>
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
