import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ScanLine,
  Smartphone,
  Volume2,
  Vibrate,
} from "lucide-react";

import { ApkStatusLine, DownloadButton } from "@/components/site/ApkDownload";
import { PhoneMockup } from "@/components/site/PhoneMockup";
import { releaseFacts } from "@/config/site";

const ease = [0.22, 1, 0.36, 1] as const;

const highlights = [
  { icon: ScanLine, label: "AI-assisted detection" },
  { icon: Volume2, label: "Spoken alerts" },
  { icon: Vibrate, label: "Vibration feedback" },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const { facts } = releaseFacts();
  const minAndroid = facts.find(
    (fact) => fact.label === "Android minimum version",
  );

  const compatibility = minAndroid
    ? `${minAndroid.value} and above`
    : "Device requirements are published with each release";

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.09,
        delayChildren: 0.04,
      },
    },
  };

  const item = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.75, ease },
    },
  };

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden pb-20 pt-10 sm:pt-16 lg:pb-28 lg:pt-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(55%_60%_at_74%_18%,var(--glow),transparent_72%)] opacity-90" />
        <div className="grid-lines absolute inset-0 opacity-40" />
      </div>

      <div className="shell grid items-center gap-14 lg:grid-cols-[1.06fr_0.94fr] lg:gap-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-[36rem] lg:max-w-none"
        >
          <motion.p
            variants={item}
            className="eyebrow flex items-center gap-2.5 text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-gold"
            />
            Voice-first walking assistant · Android
          </motion.p>

          <motion.h1
            variants={item}
            id="hero-heading"
            className="text-display mt-7 text-[clamp(2.6rem,6.4vw,4.7rem)] text-foreground"
          >
            Walk with more confidence.{" "}
            <span className="mt-1 block italic text-ink-soft">
              Let your phone speak.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-[34rem] text-[1.0625rem] leading-7 text-muted-foreground sm:leading-8"
          >
            Jonaki is a voice-first walking assistant designed to help blind and
            visually impaired people identify supported obstacles and receive
            spoken alerts using their smartphone.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <DownloadButton label="Download for Android" />
            <a
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-transparent px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              See how it works
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-6 space-y-3">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                Android app · APK
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-border" />
              <span>{compatibility}</span>
            </p>
            <ApkStatusLine live={false} className="max-w-[30rem]" />
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6"
          >
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col gap-2.5">
                <Icon
                  className="h-[1.05rem] w-[1.05rem] text-ink-soft"
                  aria-hidden="true"
                />
                <span className="text-[0.7rem] leading-snug text-muted-foreground sm:text-xs">
                  {label}
                </span>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.9, ease, delay: 0.15 }}
          className="relative mx-auto flex w-full max-w-[420px] flex-col items-center"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,var(--lavender),transparent_66%)] opacity-90 blur-2xl" />
          </div>

          <svg
            aria-hidden="true"
            viewBox="0 0 400 520"
            fill="none"
            className="pointer-events-none absolute inset-0 h-full w-full text-foreground"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M28 512 C 120 486, 96 388, 178 358 S 286 268, 318 196"
              stroke="currentColor"
              strokeOpacity="0.22"
              strokeWidth="1.2"
              strokeDasharray="1 10"
              strokeLinecap="round"
            />
            <circle cx="318" cy="196" r="3.5" fill="var(--gold)" />
            <circle
              cx="318"
              cy="196"
              r="9"
              stroke="var(--gold)"
              strokeOpacity="0.35"
            />
          </svg>

          <div className="relative z-10">
            <PhoneMockup screen="welcome" />
          </div>

          <p className="mt-7 flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-gold firefly"
            />
            Illustrative app preview
          </p>
        </motion.div>
      </div>
    </section>
  );
}
