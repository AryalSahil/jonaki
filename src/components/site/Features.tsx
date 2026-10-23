import { LifeBuoy, Map, Mic, ScanLine, Vibrate, Volume2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { features } from "@/config/site";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  scan: ScanLine,
  volume: Volume2,
  vibrate: Vibrate,
  mic: Mic,
  map: Map,
  lifebuoy: LifeBuoy,
};

export function Features() {
  const availableCount = features.filter(
    (feature) => feature.status === "available",
  ).length;
  const plannedCount = features.length - availableCount;

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="border-t border-border/80 py-20 md:py-28"
    >
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            index="02"
            label="Features"
            title={
              <span id="features-heading">
                Capabilities,
                <span className="italic"> described plainly.</span>
              </span>
            }
          />
          <Reveal className="max-w-sm md:pb-2">
            <p className="text-sm leading-6 text-muted-foreground">
              {availableCount} capabilities are part of the current Android app.{" "}
              {plannedCount > 0
                ? `The remaining ${plannedCount} are not available in this release, and are marked as such below.`
                : "Each card below is part of the shipped app."}
            </p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = icons[feature.icon] ?? ScanLine;
            const planned = feature.status === "not-in-release";

            return (
              <li key={feature.title} className="h-full">
                <Reveal delay={index * 60} className="h-full">
                  <div
                    className={cn(
                      "group flex h-full flex-col rounded-lg border p-6 transition-colors duration-300",
                      planned
                        ? "border-dashed border-border bg-muted/40"
                        : "border-border bg-background hover:border-foreground/25",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-md border transition-colors duration-300",
                          planned
                            ? "border-border bg-background/60 text-muted-foreground"
                            : "border-border bg-background text-ink-soft group-hover:border-foreground/25",
                        )}
                      >
                        <Icon
                          className="h-[1.15rem] w-[1.15rem]"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        {planned ? "Not in this release" : "In the app"}
                      </span>
                    </div>
                    <h3 className="mt-7 text-base font-medium leading-snug text-foreground">
                      {feature.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-3 text-sm leading-6",
                        planned
                          ? "text-muted-foreground/85"
                          : "text-muted-foreground",
                      )}
                    >
                      {feature.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>

        <Reveal className="mt-8">
          <p className="max-w-2xl text-xs leading-6 text-muted-foreground">
            Object detection only recognises supported visible objects, and its
            accuracy depends on light, angle, distance, and the phone's camera.
            It is not a substitute for a white cane, a guide dog, or mobility
            training.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
