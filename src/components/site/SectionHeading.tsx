import { cn } from "@/lib/utils";
import { Reveal } from "@/components/site/Reveal";

export function SectionHeading({
  index,
  label,
  title,
  lede,
  className,
  align = "left",
  inverted = false,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  className?: string;
  align?: "left" | "center";
  inverted?: boolean;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p
        className={cn(
          "eyebrow flex items-center gap-3",
          align === "center" && "justify-center",
          inverted ? "text-navy-foreground/60" : "text-muted-foreground",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block h-px w-8",
            inverted ? "bg-navy-foreground/30" : "bg-border",
          )}
        />
        <span>
          {index} — {label}
        </span>
      </p>
      <h2
        className={cn(
          "text-display mt-6 text-[clamp(2.1rem,4.6vw,3.6rem)]",
          inverted ? "text-navy-foreground" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className={cn(
            "mt-5 max-w-2xl text-[0.975rem] leading-7 sm:text-base",
            align === "center" && "mx-auto",
            inverted ? "text-navy-foreground/70" : "text-muted-foreground",
          )}
        >
          {lede}
        </p>
      ) : null}
    </Reveal>
  );
}
