import { cn } from "@/lib/utils";

/**
 * Jonaki mark: a firefly light above a quiet guiding path.
 * Uses currentColor for the path so it works on light and midnight backgrounds.
 */
export function JonakiMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("h-8 w-8", className)}
    >
      <circle cx="11" cy="38" r="2.1" fill="currentColor" opacity="0.28" />
      <circle cx="16" cy="32" r="2.1" fill="currentColor" opacity="0.45" />
      <circle cx="23" cy="27" r="2.1" fill="currentColor" opacity="0.68" />
      <circle cx="31" cy="23" r="2.1" fill="currentColor" opacity="0.85" />
      <circle
        cx="37"
        cy="15"
        r="10.5"
        stroke="var(--gold)"
        strokeWidth="1.1"
        opacity="0.35"
      />
      <circle
        cx="37"
        cy="15"
        r="7"
        stroke="var(--gold)"
        strokeWidth="0.9"
        opacity="0.5"
      />
      <circle cx="37" cy="15" r="4" fill="var(--gold)" />
      <path
        d="M37 3.2V6.4"
        stroke="var(--gold)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M45.8 15H43"
        stroke="var(--gold)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function Wordmark({
  inverted = false,
  className,
}: {
  inverted?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span
        className={cn(
          "font-display text-[1.6rem] leading-none tracking-[-0.02em]",
          inverted ? "text-navy-foreground" : "text-foreground",
        )}
      >
        Jonaki
      </span>
      <span
        aria-hidden="true"
        className="mb-[3px] inline-block h-1 w-1 rounded-full bg-gold"
      />
    </span>
  );
}
