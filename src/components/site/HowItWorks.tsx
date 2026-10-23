import { Camera, Volume2 } from "lucide-react";

import { PhoneMockup } from "@/components/site/PhoneMockup";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";

const steps = [
  {
    number: "01",
    title: "Open Jonaki",
    body: "Install the app and open it. Android asks for camera access when you start walking assistance, microphone access for voice commands, and location if you use navigation or emergency location sharing. You can review or change each permission in system settings.",
  },
  {
    number: "02",
    title: "Start walking assistance",
    body: "Hold the phone so the camera sees the path ahead, then start the assistant. The camera view is analysed for supported visible objects, or switch to pedestrian navigation for spoken walking directions.",
  },
  {
    number: "03",
    title: "Hear and feel alerts",
    body: "When a supported object is detected, Jonaki speaks a short warning and — if you have turned it on — vibrates. Voice, speech rate, and vibration live in settings.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="border-t border-border/80 py-20 md:py-28"
    >
      <div className="shell grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
        <div>
          <SectionHeading
            index="03"
            label="How it works"
            title={
              <span id="how-heading">
                From pocket to pavement,
                <span className="italic"> in three steps.</span>
              </span>
            }
            lede="Jonaki is deliberately simple to start. The controls stay in one place, and the app explains each permission before it is used."
          />

          <ol className="mt-12">
            {steps.map((step) => (
              <li
                key={step.number}
                className="grid grid-cols-[auto_1fr] gap-5 border-t border-border py-7 first:border-t-0 first:pt-0 sm:gap-8"
              >
                <span
                  aria-hidden="true"
                  className="text-display pt-0.5 text-[1.75rem] leading-none text-muted-foreground/45"
                >
                  {step.number}
                </span>
                <div>
                  <p className="eyebrow text-muted-foreground">
                    Step {step.number.replace(/^0/, "")}
                  </p>
                  <h3 className="mt-2.5 font-display text-[1.6rem] leading-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 max-w-xl text-sm leading-6 text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-5 sm:flex-row sm:items-start sm:gap-4">
            <Camera
              className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft"
              aria-hidden="true"
            />
            <p className="text-sm leading-6 text-muted-foreground">
              Object detection needs the camera, so it only works while you are
              actively using walking assistance. Nothing on this website asks
              for camera, microphone, or location access.
            </p>
          </div>
        </div>

        <Reveal className="lg:sticky lg:top-28">
          <figure className="flex flex-col items-center rounded-lg border border-border bg-muted/30 px-6 py-10 sm:px-10">
            <PhoneMockup screen="dashboard" />
            <figcaption className="mt-8 max-w-xs text-center text-xs leading-5 text-muted-foreground">
              <span className="mb-2 flex items-center justify-center gap-1.5 text-[0.6rem] uppercase tracking-[0.16em]">
                <Volume2 className="h-3 w-3" aria-hidden="true" />
                Illustrative mockup
              </span>
              A static preview of the Jonaki dashboard. No product video is
              available on this site yet.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
