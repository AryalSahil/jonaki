import { useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";

import { PhoneMockup, screens } from "@/components/site/PhoneMockup";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export function AppPreview() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;
  const current = openIndex === null ? null : screens[openIndex];

  const show = (next: number) => {
    const total = screens.length;
    setOpenIndex(((next % total) + total) % total);
  };

  return (
    <section
      id="preview"
      aria-labelledby="preview-heading"
      className="border-t border-border/80 py-20 md:py-28"
    >
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            index="04"
            label="App preview"
            title={
              <span id="preview-heading">
                A look at
                <span className="italic"> the four core screens.</span>
              </span>
            }
          />
          <Reveal className="max-w-sm md:pb-2">
            <p className="text-sm leading-6 text-muted-foreground">
              These previews recreate the current Android interface — welcome,
              dashboard, walking assistance, and permissions. They are
              illustrations, not device captures.
            </p>
          </Reveal>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-6 lg:grid-cols-4">
          {screens.map((screen, index) => (
            <li key={screen.id}>
              <Reveal delay={index * 70}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  aria-haspopup="dialog"
                  aria-label={`Open a larger preview of the ${screen.label} screen (illustrative mockup)`}
                  className="group block w-full rounded-lg text-left"
                >
                  <span className="relative flex justify-center overflow-hidden rounded-lg border border-border bg-muted/40 px-3 py-6 transition-colors duration-300 group-hover:border-foreground/20 sm:px-6 sm:py-8">
                    <PhoneMockup
                      screen={screen.id}
                      className="max-w-[190px] transition-transform duration-500 group-hover:-translate-y-1.5 sm:max-w-[220px]"
                    />
                    <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Maximize2 className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="mt-4 flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {screen.label}
                    </span>
                    <span className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                      Preview
                    </span>
                  </span>
                </button>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="mt-10">
          <p className="max-w-2xl text-xs leading-6 text-muted-foreground">
            The gallery shows four core screens. Captures of emergency help,
            navigation, and settings will be added as they become available.
          </p>
        </Reveal>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null);
        }}
      >
        <DialogContent
          className="max-h-[92vh] max-w-3xl gap-0 overflow-y-auto p-6 shadow-none sm:p-8"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              show((openIndex ?? 0) + 1);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              show((openIndex ?? 0) - 1);
            }
          }}
        >
          {current ? (
            <>
              <DialogTitle className="text-display pr-10 text-2xl">
                {current.label} screen
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-6">
                {current.description}
              </DialogDescription>

              <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
                <div className="flex justify-center rounded-lg border border-border bg-muted/40 p-5">
                  {" "}
                  <PhoneMockup screen={current.id} className="max-w-[260px]" />
                </div>

                <div>
                  <p
                    aria-live="polite"
                    className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    Screen {(openIndex ?? 0) + 1} of {screens.length} ·{" "}
                    {current.label}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Illustrative mockup. Layout, labels, and alert copy may
                    differ in the installed app.
                  </p>

                  <div className="mt-6 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11"
                      onClick={() => show((openIndex ?? 0) - 1)}
                      aria-label="Previous screen preview"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11"
                      onClick={() => show((openIndex ?? 0) + 1)}
                      aria-label="Next screen preview"
                    >
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <span className="ml-1 text-xs text-muted-foreground">
                      Use the arrow keys to browse
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex justify-end border-t border-border pt-5">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="h-10 px-4">
                    Close preview
                  </Button>
                </DialogClose>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
