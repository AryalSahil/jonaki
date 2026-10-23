import type { ReactElement, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BatteryFull,
  Bell,
  Camera,
  CircleHelp,
  Footprints,
  Headphones,
  Info,
  MapPin,
  Mic,
  Navigation,
  Settings,
  Signal,
  Volume2,
  Wifi,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type ScreenId = "welcome" | "dashboard" | "walking" | "permissions";

/**
 * Optional real screenshot overrides. Drop PNGs into `public/screens/`, add the
 * paths here, and every phone (hero, how-it-works, gallery, lightbox) will use
 * the real capture instead of the HTML recreation below.
 *
 *   welcome: "/screens/welcome.png",
 *   dashboard: "/screens/dashboard.png",
 */
export const screenImages: Partial<Record<ScreenId, string>> = {};

export const screens: {
  id: ScreenId;
  label: string;
  description: string;
}[] = [
  {
    id: "welcome",
    label: "Welcome",
    description:
      "The opening screen: the night-path illustration, the Jonaki wordmark, Start Assistance, and the first-launch tutorial.",
  },
  {
    id: "dashboard",
    label: "Main dashboard",
    description:
      "Walking assistance, pedestrian navigation, voice commands, emergency help, settings, and a directional audio test in one menu.",
  },
  {
    id: "walking",
    label: "Walking assistance",
    description:
      "The active camera view with a highlighted obstacle, the spoken alert, and a large stop control.",
  },
  {
    id: "permissions",
    label: "Permissions & setup",
    description:
      "Explains camera, microphone, spoken audio, and optional location access before Android asks for each permission.",
  },
];

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-4 pb-0.5 pt-2 text-[7px] font-medium text-white/90">
      <span className="flex items-center gap-1">
        12:49
        <span className="flex h-[7px] w-[9px] items-center justify-center rounded-[1.5px] border border-white/60">
          <span className="h-[3px] w-[4px] rounded-[0.5px] bg-white/60" />
        </span>
      </span>
      <span className="flex items-center gap-1">
        <Signal className="h-2 w-2" aria-hidden="true" />
        <Wifi className="h-2 w-2" aria-hidden="true" />
        <BatteryFull className="h-2.5 w-2.5" aria-hidden="true" />
      </span>
    </div>
  );
}

function HomeBar() {
  return (
    <span className="mx-auto mb-1.5 mt-1 block h-[3px] w-20 shrink-0 rounded-full bg-white/75" />
  );
}

function SpeakerButton({ tone = "cyan" }: { tone?: "cyan" | "gold" }) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-full border",
        tone === "gold"
          ? "border-[#F5C84C] text-[#F5C84C]"
          : "border-[#2B4A66] bg-[#0F2033] text-[#41C6E8]",
      )}
    >
      <Volume2 className="h-3 w-3" aria-hidden="true" />
    </span>
  );
}

function WelcomeArtwork() {
  const stars = [
    [22, 24, 0.7],
    [38, 52, 0.5],
    [74, 18, 0.8],
    [96, 40, 0.5],
    [118, 14, 0.6],
    [142, 30, 0.7],
    [166, 16, 0.5],
    [188, 36, 0.7],
    [214, 22, 0.6],
    [236, 44, 0.5],
    [206, 62, 0.4],
    [70, 70, 0.4],
    [248, 18, 0.7],
  ] as const;

  const fireflies = [
    [30, 118, 0.9],
    [44, 132, 0.6],
    [66, 124, 0.8],
    [86, 140, 0.5],
    [216, 120, 0.8],
    [232, 138, 0.6],
    [196, 134, 0.5],
    [176, 144, 0.7],
  ] as const;

  return (
    <svg
      viewBox="0 0 260 152"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="jonaki-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#071120" />
          <stop offset="0.55" stopColor="#0A1B2A" />
          <stop offset="1" stopColor="#0D2A33" />
        </linearGradient>
        <linearGradient id="jonaki-path" x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="#CFFBFF" />
          <stop offset="1" stopColor="#4DD9E9" stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id="jonaki-halo" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#6DF3FF" stopOpacity="0.6" />
          <stop offset="1" stopColor="#6DF3FF" stopOpacity="0" />
        </radialGradient>
        <filter id="jonaki-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <rect width="260" height="152" fill="url(#jonaki-sky)" />

      {stars.map(([x, y, opacity]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="0.7"
          fill="#E9F5FF"
          opacity={opacity}
        />
      ))}

      <circle cx="52" cy="34" r="13" fill="#F5C84C" opacity="0.92" />
      <circle cx="57" cy="30" r="12" fill="#081526" />

      <path d="M0 118 Q 42 96 92 116 T 260 100 V152 H0 Z" fill="#091827" />
      <path d="M0 136 Q 58 116 120 136 T 260 124 V152 H0 Z" fill="#07131F" />

      <g fill="#091A24">
        <path d="M0 108 Q 14 92 26 108 V152 H0 Z" />
        <path d="M234 102 Q 250 86 260 102 V152 H234 Z" />
      </g>
      <g stroke="#122B36" strokeWidth="1.2" opacity="0.9">
        <path d="M12 152 V104" />
        <path d="M12 116 L2 106 M12 124 L24 112" />
        <path d="M248 152 V100" />
        <path d="M248 114 L236 104 M248 124 L258 112" />
      </g>

      <ellipse
        cx="150"
        cy="128"
        rx="70"
        ry="22"
        fill="url(#jonaki-halo)"
        filter="url(#jonaki-blur)"
      />

      <path
        d="M92 152 C 108 128, 146 118, 174 100 S 218 72, 240 62"
        stroke="#4DD9E9"
        strokeWidth="16"
        strokeLinecap="round"
        opacity="0.18"
        filter="url(#jonaki-blur)"
      />
      <path
        d="M92 152 C 108 128, 146 118, 174 100 S 218 72, 240 62"
        stroke="url(#jonaki-path)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M92 152 C 108 128, 146 118, 174 100 S 218 72, 240 62"
        stroke="#EAFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />

      <g stroke="#D5E3EC" strokeWidth="2.1" strokeLinecap="round" fill="none">
        <circle cx="126" cy="97" r="4.6" fill="#D5E3EC" stroke="none" />
        <path d="M126 102 L126 121" />
        <path d="M126 121 L118 138 M126 121 L134 138" />
        <path d="M126 107 L115 116 M126 107 L137 113" />
        <path d="M137 113 L154 145" stroke="#F5C84C" strokeWidth="1.4" />
      </g>
      <path
        d="M118 94 Q126 87 134 94"
        stroke="#41C6E8"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="118" cy="94" r="2" fill="#41C6E8" />
      <circle cx="134" cy="94" r="2" fill="#41C6E8" />

      {fireflies.map(([x, y, opacity]) => (
        <g key={`f-${x}-${y}`}>
          <circle cx={x} cy={y} r="3.4" fill="#F5C84C" opacity={0.16} />
          <circle cx={x} cy={y} r="1.2" fill="#F5C84C" opacity={opacity} />
        </g>
      ))}

      <g transform="translate(130 6)" opacity="0.9">
        <path
          d="M-8 8 V4 A8 8 0 0 1 8 4 V8"
          stroke="#BFEAF3"
          strokeWidth="1.2"
          fill="none"
        />
        <rect x="-10" y="7" width="4" height="7" rx="1.6" fill="#BFEAF3" />
        <rect x="6" y="7" width="4" height="7" rx="1.6" fill="#BFEAF3" />
        <text
          x="0"
          y="25"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="4.4"
          letterSpacing="1"
          fill="#BFEAF3"
        >
          VOICE GUIDANCE
        </text>
      </g>

      <g fontFamily="Inter, sans-serif" fontSize="4.3" letterSpacing="0.4">
        <path d="M144 24 L172 34" stroke="#3B6178" strokeWidth="0.6" />
        <rect
          x="170"
          y="27"
          width="66"
          height="11"
          rx="5.5"
          fill="#0A1B28"
          stroke="#2E5266"
        />
        <text x="176" y="34.5" fill="#A8DDE8">
          TURN LEFT IN 50 FT
        </text>

        <path d="M148 40 L178 50" stroke="#3B6178" strokeWidth="0.6" />
        <rect
          x="176"
          y="43"
          width="54"
          height="11"
          rx="5.5"
          fill="#0A1B28"
          stroke="#2E5266"
        />
        <text x="182" y="50.5" fill="#A8DDE8">
          OBSTACLE AHEAD
        </text>

        <path d="M152 56 L198 66" stroke="#3B6178" strokeWidth="0.6" />
        <rect
          x="196"
          y="59"
          width="52"
          height="11"
          rx="5.5"
          fill="#0A1B28"
          stroke="#2E5266"
        />
        <text x="202" y="66.5" fill="#A8DDE8">
          SAFE PATH FOUND
        </text>
      </g>
    </svg>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex h-full flex-col bg-[#060C16] px-2.5">
      <StatusBar />
      <div className="mt-1 flex justify-end">
        <SpeakerButton />
      </div>

      <div className="mt-1.5 overflow-hidden rounded-xl border border-[#263B54]">
        <div className="aspect-[260/152]">
          <WelcomeArtwork />
        </div>
      </div>

      <div className="mt-2.5 text-center">
        <p className="text-[17px] font-bold leading-none text-[#F5C84C]">
          Jonaki
        </p>
        <p className="mt-1 text-[8px] font-semibold text-[#41C6E8]">
          Your Voice Walking Assistant
        </p>
        <p className="mt-1 font-display text-[8px] italic text-[#DDE5EF]">
          “A little light in every step”
        </p>
        <p className="mx-auto mt-1.5 max-w-[190px] text-[5.6px] leading-[1.65] text-[#A9B6C8]">
          Designed for blind &amp; visually impaired explorers. High-contrast
          tactile interface with spoken audio and directional cues.
        </p>
      </div>

      <div className="mt-auto space-y-1.5 pb-1">
        <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#F5C84C] py-2.5 text-[9px] font-bold text-[#141109]">
          <Footprints className="h-3 w-3" aria-hidden="true" />
          Start Assistance
        </div>
        <div className="flex items-center justify-center gap-1.5 rounded-xl border border-[#41C6E8] py-2.5 text-[7.5px] font-semibold text-[#41C6E8]">
          <CircleHelp className="h-2.5 w-2.5" aria-hidden="true" />
          First-Launch Tutorial &amp; Permissions
        </div>
      </div>

      <HomeBar />
    </div>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
  color,
  tint,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  color: string;
  tint: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-md border bg-[#0A1420] px-2 py-2.5"
      style={{ borderColor: color }}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: tint, color }}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[8px] font-bold leading-tight text-[#F1F4F9]">
          {title}
        </span>
        <span className="mt-0.5 block text-[6.2px] leading-[1.35] text-[#9DAABC]">
          {subtitle}
        </span>
      </span>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="flex h-full flex-col bg-[#060C16] px-2">
      <StatusBar />

      <div className="mt-1 flex items-start justify-between px-0.5">
        <div>
          <p className="text-[17px] font-bold leading-none text-[#F5C84C]">
            Jonaki
          </p>
          <p className="mt-0.5 text-[7px] font-medium text-[#41C6E8]">
            Voice Walking Assistant
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#F5C84C] text-[#F5C84C]">
            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#182B44] text-[#41C6E8]">
            <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="mt-2 rounded-md border border-[#2A4266] bg-[#0C1A2C] px-2 py-2">
        <p className="flex items-start gap-1.5 text-[7.4px] font-bold leading-tight text-[#41C6E8]">
          <Info className="mt-[1px] h-2.5 w-2.5 shrink-0" aria-hidden="true" />
          Phase 4 Navigation &amp; Emergency SOS Active
        </p>
        <p className="mt-1 pl-4 text-[6px] leading-[1.5] text-[#9DAABC]">
          Pedestrian routing, turn-by-turn spoken guidance, cancelable emergency
          calling, and SMS location sharing ready.
        </p>
      </div>

      <div className="mt-2 space-y-2">
        <ActionCard
          icon={<Footprints className="h-3.5 w-3.5" aria-hidden="true" />}
          title="Start Walking Assistance"
          subtitle="Camera obstacle scanning & 3D directional audio"
          color="#38DD9B"
          tint="rgba(56,221,155,0.16)"
        />
        <ActionCard
          icon={<Navigation className="h-3.5 w-3.5" aria-hidden="true" />}
          title="Pedestrian Navigation"
          subtitle="Turn-by-turn walking routes via OpenStreetMap & GPS"
          color="#4AB8FF"
          tint="rgba(74,184,255,0.15)"
        />
        <ActionCard
          icon={<Mic className="h-3.5 w-3.5" aria-hidden="true" />}
          title="Voice Commands"
          subtitle="Hands-free queries, scene questions & status"
          color="#41C6E8"
          tint="rgba(65,198,232,0.15)"
        />
        <ActionCard
          icon={<AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />}
          title="Emergency Help"
          subtitle="SOS alarm siren, GPS broadcast & rapid contacts"
          color="#F2547D"
          tint="rgba(242,84,125,0.16)"
        />
        <ActionCard
          icon={<Settings className="h-3.5 w-3.5" aria-hidden="true" />}
          title="Settings & Audio"
          subtitle="Speech speed, warning volume, language & haptics"
          color="#F5C84C"
          tint="rgba(245,200,76,0.16)"
        />
      </div>

      <div className="mt-auto flex items-center justify-between rounded-md border border-[#2A4266] bg-[#0C1A2C] px-2 py-2">
        <div className="min-w-0">
          <p className="text-[6.8px] font-bold text-[#F1F4F9]">
            Directional Audio Cue
          </p>
          <p className="mt-0.5 text-[5.6px] leading-snug text-[#9DAABC]">
            Test simulated obstacle warning tone &amp; haptic buzz
          </p>
        </div>
        <span className="ml-1 flex shrink-0 items-center gap-0.5 rounded border border-[#41C6E8] bg-[#15334A] px-1.5 py-1 text-[5.8px] font-bold text-[#41C6E8]">
          <Bell className="h-2 w-2" aria-hidden="true" />
          Test
        </span>
      </div>

      <HomeBar />
    </div>
  );
}

function PermissionCard({
  index,
  title,
  status,
  description,
  icon,
  tone,
  action,
}: {
  index: number;
  title: string;
  status: "requires" | "active";
  description: string;
  icon: ReactNode;
  tone: "gold" | "cyan" | "green";
  action?: string;
}) {
  const iconColor =
    tone === "gold" ? "#F5C84C" : tone === "cyan" ? "#41C6E8" : "#38DD9B";
  const iconTint =
    tone === "gold"
      ? "rgba(245,200,76,0.14)"
      : tone === "cyan"
        ? "rgba(65,198,232,0.14)"
        : "rgba(56,221,155,0.14)";

  return (
    <div
      className="rounded-lg border bg-[#0A1622] p-2"
      style={{
        borderColor: status === "active" ? "#2E6B58" : "#294663",
      }}
    >
      <div className="flex items-start gap-1.5">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: iconTint, color: iconColor }}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[6.8px] font-bold leading-tight text-[#F1F4F9]">
            {index}. {title}
          </p>
          <p className="text-[4.7px] font-medium" style={{ color: iconColor }}>
            {index === 4 ? "Optional enhancement" : "Core feature"}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-1 py-[2px] text-[4.2px] font-bold leading-tight",
            status === "active"
              ? "border-[#2E6B58] bg-[#0C241E] text-[#4BE0A8]"
              : "border-[#7A2C46] bg-[#2A0F1B] text-[#FF7EA2]",
          )}
        >
          {status === "active" ? "✓ Active by Default" : "Requires Permission"}
        </span>
      </div>

      <p className="mt-1.5 text-[5.4px] leading-[1.55] text-[#B5C1D1]">
        {description}
      </p>

      {action ? (
        <div className="mt-1.5 rounded bg-[#43C9EA] py-1.5 text-center text-[6.4px] font-bold text-[#071019]">
          {action}
        </div>
      ) : null}
    </div>
  );
}

function PermissionsScreen() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#060C16] px-2">
      <StatusBar />

      <div className="mt-1 flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <ArrowLeft className="h-3 w-3 text-[#F5C84C]" aria-hidden="true" />
          <p className="text-[8.2px] font-bold text-[#F1F4F9]">
            Permissions &amp; Setup
          </p>
        </div>
        <SpeakerButton />
      </div>

      <h3 className="mt-2 text-[13.5px] font-extrabold leading-tight text-[#F5C84C]">
        Sensory Access for Walking
      </h3>
      <p className="mt-1 text-[5.8px] leading-[1.6] text-[#A9B6C8]">
        Jonaki uses your phone&apos;s sensors to act as your eyes and ears on
        the sidewalk. Review each permission below:
      </p>

      <div className="mt-2 space-y-2">
        <PermissionCard
          index={1}
          title="Camera Access"
          status="requires"
          tone="gold"
          icon={<Camera className="h-3 w-3" aria-hidden="true" />}
          description="Used to scan sidewalks, detect ground obstacles, and provide tactile directional warnings."
          action="Grant Permission"
        />
        <PermissionCard
          index={2}
          title="Microphone Access"
          status="requires"
          tone="cyan"
          icon={<Mic className="h-3 w-3" aria-hidden="true" />}
          description="Used for natural voice commands, querying surroundings, and hands-free conversational assistance."
          action="Grant Permission"
        />
        <PermissionCard
          index={3}
          title="Spoken Audio & Tones"
          status="active"
          tone="green"
          icon={<Headphones className="h-3 w-3" aria-hidden="true" />}
          description="High-contrast text-to-speech feedback and 3D directional obstacle beeps. Uses your phone speaker or headphones."
        />
        <PermissionCard
          index={4}
          title="Location (Optional)"
          status="requires"
          tone="gold"
          icon={<MapPin className="h-3 w-3" aria-hidden="true" />}
          description="Provides street name awareness, landmark proximity, and sends exact GPS coordinates during an emergency."
          action="Grant Permission"
        />
      </div>

      <HomeBar />
    </div>
  );
}

function WalkingScreen() {
  return (
    <div className="flex h-full flex-col bg-[#060C16] text-white">
      <StatusBar />

      <div className="flex items-center justify-between px-3">
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#2C4560]">
          <ArrowLeft
            className="h-2.5 w-2.5 text-[#DDE5EF]"
            aria-hidden="true"
          />
        </span>
        <span className="flex items-center gap-1 rounded-full border border-[#2C4560] px-1.5 py-[3px] text-[5.6px] font-medium">
          <span
            className="h-1 w-1 animate-pulse rounded-full bg-[#38DD9B]"
            aria-hidden="true"
          />
          Assistance on
        </span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#2C4560]">
          <Mic className="h-2.5 w-2.5 text-[#41C6E8]" aria-hidden="true" />
        </span>
      </div>

      <div className="relative mx-2 mt-1.5 flex-1 overflow-hidden rounded-lg bg-[linear-gradient(180deg,#122435_0%,#0C1A26_48%,#081119_100%)]">
        <svg
          viewBox="0 0 200 300"
          className="absolute inset-0 h-full w-full"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            d="M100 128 L14 300 M100 128 L64 300 M100 128 L136 300 M100 128 L186 300"
            stroke="#9FEAF5"
            strokeOpacity="0.12"
          />
          <path
            d="M0 214 H200 M0 262 H200"
            stroke="#9FEAF5"
            strokeOpacity="0.08"
          />
          <path
            d="M42 118 C 76 100, 124 100, 158 118"
            stroke="#9FEAF5"
            strokeOpacity="0.1"
          />
        </svg>

        <div
          className="absolute left-1/2 top-[45%] h-16 w-20 -translate-x-1/2 rounded-md border border-[#F5C84C]"
          aria-hidden="true"
        >
          <span className="absolute -top-3.5 left-0 rounded-sm bg-[#F5C84C] px-1 py-0.5 text-[5.4px] font-bold text-[#141109]">
            chair · 2 m
          </span>
        </div>
        <div
          className="absolute left-1/2 top-[52%] h-20 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#41C6E8]/10 blur-2xl"
          aria-hidden="true"
        />
        <p className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[4.8px] uppercase tracking-[0.18em] text-white/40">
          Live camera view
        </p>
      </div>

      <div className="mx-2 mb-2 mt-1.5 rounded-lg border border-[#2A4266] bg-[#0C1A2C] p-1.5">
        <div className="flex items-start gap-1.5">
          <Volume2
            className="mt-[1px] h-2.5 w-2.5 shrink-0 text-[#F5C84C]"
            aria-hidden="true"
          />
          <div>
            <p className="text-[6.6px] font-bold leading-snug text-[#F1F4F9]">
              Chair ahead, two steps
            </p>
            <p className="mt-0.5 text-[5px] text-[#9DAABC]">
              Keep right · vibration alert
            </p>
          </div>
        </div>
        <div className="mt-1.5 rounded bg-[#15334A] py-1 text-center text-[5.8px] font-semibold text-[#41C6E8]">
          Stop assistance
        </div>
      </div>

      <HomeBar />
    </div>
  );
}

const screenMap: Record<ScreenId, () => ReactElement> = {
  welcome: WelcomeScreen,
  dashboard: DashboardScreen,
  walking: WalkingScreen,
  permissions: PermissionsScreen,
};

/**
 * Decorative Android mockup. Always aria-hidden: real descriptions live in the
 * gallery labels and captions next to it. Set `screenImages` to use real
 * captures instead of the HTML recreation.
 */
export function PhoneMockup({
  screen = "welcome",
  className,
}: {
  screen?: ScreenId;
  className?: string;
}) {
  const Screen = screenMap[screen];
  const image = screenImages[screen];

  return (
    <div
      className={cn("relative w-full max-w-[266px]", className)}
      aria-hidden="true"
    >
      <div className="relative rounded-[2.5rem] border border-white/15 bg-[#050A12] p-[7px] shadow-[0_45px_90px_-55px_rgba(0,0,0,0.95)]">
        <span className="absolute -right-[2px] top-[86px] h-10 w-[2px] rounded-full bg-white/20" />
        <span className="absolute -left-[2px] top-[70px] h-6 w-[2px] rounded-full bg-white/15" />
        <div className="relative aspect-[9/19] overflow-hidden rounded-[2rem] bg-[#060C16]">
          {image ? (
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full flex-col">
              <Screen />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
