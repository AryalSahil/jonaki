import {
  ArrowLeft,
  Battery,
  Camera,
  ChevronRight,
  House,
  Info,
  Mic,
  Settings2,
  Volume2,
  Vibrate,
  Wifi,
} from "lucide-react";

import { JonakiMark } from "@/components/site/Brand";
import { cn } from "@/lib/utils";

export type ScreenId = "welcome" | "dashboard" | "walking" | "voice";

export const screens: {
  id: ScreenId;
  label: string;
  description: string;
}[] = [
  {
    id: "welcome",
    label: "Welcome",
    description:
      "The opening screen: Jonaki's mark, tagline, and a single start button for walking assistance.",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description:
      "The main screen: camera status, the start button, and shortcuts to voice, vibration, and app information.",
  },
  {
    id: "walking",
    label: "Walking assistance",
    description:
      "The active assistance screen: live camera view, a highlighted detected object, and the spoken alert text.",
  },
  {
    id: "voice",
    label: "Voice settings",
    description:
      "Settings for spoken alerts, vibration feedback, speech rate, and language.",
  },
];

function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 pb-1 pt-2.5 text-[8px] font-medium",
        dark ? "text-white/65" : "text-foreground/55",
      )}
    >
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <Wifi className="h-2.5 w-2.5" aria-hidden="true" />
        <Battery className="h-2.5 w-2.5" aria-hidden="true" />
      </span>
    </div>
  );
}

function Toggle({ on = true }: { on?: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-3.5 w-6 shrink-0 items-center rounded-full",
        on ? "bg-foreground" : "bg-border",
      )}
    >
      <span
        className={cn(
          "absolute h-2.5 w-2.5 rounded-full bg-background transition-none",
          on ? "right-0.5" : "left-0.5",
        )}
      />
    </span>
  );
}

function Row({
  icon,
  title,
  detail,
  trailing,
}: {
  icon: React.ReactNode;
  title: string;
  detail?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/60 py-2 last:border-b-0">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/80 text-foreground/70">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[9px] font-medium text-foreground">
          {title}
        </span>
        {detail ? (
          <span className="mt-0.5 block truncate text-[7.5px] leading-tight text-muted-foreground">
            {detail}
          </span>
        ) : null}
      </span>
      {trailing}
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex h-full flex-col px-5 pb-4 pt-3">
      <p className="flex items-center gap-1.5 text-[7px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
        Voice-first
      </p>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <JonakiMark className="h-12 w-12" />
        <p className="mt-4 font-display text-[26px] leading-none text-foreground">
          Jonaki
        </p>
        <p className="mt-2 text-[7px] uppercase tracking-[0.2em] text-muted-foreground">
          Walking assistant
        </p>
        <p className="mt-6 font-display text-[17px] leading-[1.25] text-ink-soft">
          A little light
          <br />
          in every step.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 rounded-lg bg-foreground px-3 py-2.5 text-[9.5px] font-medium text-background">
          <Camera className="h-3 w-3" aria-hidden="true" />
          Start assistance
        </div>
        <div className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-[9.5px] font-medium text-foreground">
          <Volume2 className="h-3 w-3" aria-hidden="true" />
          Voice settings
        </div>
      </div>

      <p className="mt-3 text-center text-[7px] leading-relaxed text-muted-foreground">
        Assistive tool. Not a replacement
        <br />
        for a cane or guide dog.
      </p>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="flex h-full flex-col px-4 pb-2 pt-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[7.5px] text-muted-foreground">Wednesday</p>
          <p className="mt-0.5 text-[12px] font-medium text-foreground">
            Good morning
          </p>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-foreground/70">
          <Settings2 className="h-3 w-3" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-foreground p-3 text-background">
        <p className="flex items-center gap-1.5 text-[6.5px] uppercase tracking-[0.14em] text-background/55">
          <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
          Camera ready
        </p>
        <p className="mt-2 font-display text-[16px] leading-tight">
          Start walking assistance
        </p>
        <p className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[7px] text-background/65">
          <span>Spoken alerts on</span>
          <span aria-hidden="true">·</span>
          <span>Vibration on</span>
        </p>
      </div>

      <div className="mt-3">
        <Row
          icon={<Volume2 className="h-3 w-3" aria-hidden="true" />}
          title="Voice settings"
          detail="Speech rate, language"
          trailing={
            <ChevronRight
              className="h-2.5 w-2.5 text-muted-foreground"
              aria-hidden="true"
            />
          }
        />
        <Row
          icon={<Vibrate className="h-3 w-3" aria-hidden="true" />}
          title="Vibration"
          detail="Tactile alerts"
          trailing={<Toggle />}
        />
        <Row
          icon={<Info className="h-3 w-3" aria-hidden="true" />}
          title="About Jonaki"
          detail="Version and permissions"
          trailing={
            <ChevronRight
              className="h-2.5 w-2.5 text-muted-foreground"
              aria-hidden="true"
            />
          }
        />
      </div>

      <div className="mt-auto flex items-center justify-around border-t border-border/70 pt-2 text-muted-foreground">
        <span className="flex flex-col items-center gap-0.5">
          <House className="h-3 w-3 text-foreground" aria-hidden="true" />
          <span className="h-0.5 w-3 rounded-full bg-foreground" />
        </span>
        <Volume2 className="h-3 w-3" aria-hidden="true" />
        <Vibrate className="h-3 w-3" aria-hidden="true" />
        <Info className="h-3 w-3" aria-hidden="true" />
      </div>
    </div>
  );
}

function WalkingScreen() {
  return (
    <div className="flex h-full flex-col bg-[#0f131c] text-white">
      <StatusBar dark />

      <div className="flex items-center justify-between px-3.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15">
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-white/15 px-2 py-1 text-[7px] font-medium">
          <span
            className="h-1 w-1 animate-pulse rounded-full bg-gold"
            aria-hidden="true"
          />
          Assistance on
        </span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15">
          <Mic className="h-3 w-3" aria-hidden="true" />
        </span>
      </div>

      <div className="relative mx-3 mt-3 flex-1 overflow-hidden rounded-xl bg-[linear-gradient(180deg,#242c3d_0%,#1a2130_45%,#121722_100%)]">
        <svg
          viewBox="0 0 200 300"
          className="absolute inset-0 h-full w-full"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            d="M100 128 L14 300 M100 128 L64 300 M100 128 L136 300 M100 128 L186 300"
            stroke="white"
            strokeOpacity="0.09"
          />
          <path
            d="M0 214 H200 M0 262 H200"
            stroke="white"
            strokeOpacity="0.06"
          />
          <path
            d="M42 118 C 76 100, 124 100, 158 118"
            stroke="white"
            strokeOpacity="0.08"
          />
        </svg>

        <div
          className="absolute left-1/2 top-[45%] h-16 w-20 -translate-x-1/2 rounded-md border border-gold/85"
          aria-hidden="true"
        >
          <span className="absolute -top-4 left-0 rounded-sm bg-gold px-1 py-0.5 text-[6.5px] font-semibold text-[#171a24]">
            chair · 2 m
          </span>
        </div>

        <div
          className="absolute left-1/2 top-[52%] h-20 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-2xl"
          aria-hidden="true"
        />
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[6px] uppercase tracking-[0.18em] text-white/35">
          Live camera view
        </p>
      </div>

      <div className="mx-3 mb-3 mt-2.5 rounded-xl border border-white/10 bg-white/[0.06] p-2.5">
        <div className="flex items-start gap-2">
          <Volume2
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold"
            aria-hidden="true"
          />
          <div>
            <p className="text-[9.5px] font-medium leading-snug">
              Chair ahead, two steps
            </p>
            <p className="mt-0.5 text-[7px] text-white/55">
              Keep right · vibration alert
            </p>
          </div>
        </div>
        <div className="mt-2 rounded-md bg-white/10 px-2 py-1.5 text-center text-[8px] font-medium">
          Stop assistance
        </div>
      </div>
    </div>
  );
}

function VoiceScreen() {
  return (
    <div className="flex h-full flex-col px-4 pb-3 pt-2">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-foreground/70">
          <ArrowLeft className="h-2.5 w-2.5" aria-hidden="true" />
        </span>
        <p className="text-[10px] font-medium text-foreground">
          Voice settings
        </p>
      </div>

      <div className="mt-3">
        <Row
          icon={<Volume2 className="h-3 w-3" aria-hidden="true" />}
          title="Spoken alerts"
          detail="Speak detected objects"
          trailing={<Toggle />}
        />
        <Row
          icon={<Vibrate className="h-3 w-3" aria-hidden="true" />}
          title="Vibration"
          detail="Tactile alert with each warning"
          trailing={<Toggle />}
        />

        <div className="border-b border-border/60 py-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-medium">Speech rate</p>
            <span className="text-[7.5px] text-muted-foreground">Normal</span>
          </div>
          <div className="relative mt-2 h-1 rounded-full bg-border">
            <span className="absolute inset-y-0 left-0 w-[58%] rounded-full bg-foreground" />
            <span className="absolute -top-[3px] left-[58%] h-[7px] w-[7px] -translate-x-1/2 rounded-full border border-background bg-foreground" />
          </div>
        </div>

        <Row
          icon={<Mic className="h-3 w-3" aria-hidden="true" />}
          title="Language"
          detail="Alert voice"
          trailing={
            <span className="text-[7.5px] text-muted-foreground">English</span>
          }
        />
      </div>

      <p className="mt-3 rounded-md bg-lavender/60 px-2 py-1.5 text-[7px] leading-relaxed text-ink-soft">
        Changes apply from the next spoken alert.
      </p>

      <div className="mt-auto rounded-lg bg-foreground px-3 py-2 text-center text-[9px] font-medium text-background">
        Done
      </div>
    </div>
  );
}

const screenMap: Record<ScreenId, () => React.ReactElement> = {
  welcome: WelcomeScreen,
  dashboard: DashboardScreen,
  walking: WalkingScreen,
  voice: VoiceScreen,
};

/**
 * Decorative Android mockup. Always aria-hidden: real descriptions live in the
 * gallery labels and captions next to it.
 */
export function PhoneMockup({
  screen = "welcome",
  className,
}: {
  screen?: ScreenId;
  className?: string;
}) {
  const Screen = screenMap[screen];

  return (
    <div
      className={cn("relative w-full max-w-[266px]", className)}
      aria-hidden="true"
    >
      <div className="relative rounded-[2.4rem] border border-foreground/15 bg-[#171a24] p-[8px] shadow-[0_30px_60px_-40px_rgba(15,19,28,0.55)]">
        <span className="absolute -right-[2px] top-[86px] h-10 w-[2px] rounded-full bg-foreground/20" />
        <span className="absolute -left-[2px] top-[70px] h-6 w-[2px] rounded-full bg-foreground/15" />
        <div className="relative aspect-[9/19] overflow-hidden rounded-[1.95rem] bg-paper">
          <span className="absolute left-1/2 top-[7px] z-20 h-[14px] w-[62px] -translate-x-1/2 rounded-full bg-[#0d1018]" />
          <div className="flex h-full flex-col">
            <StatusBar dark={screen === "walking"} />
            <div className="min-h-0 flex-1">
              <Screen />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
