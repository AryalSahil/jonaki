import { AlertTriangle, Check } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";

const practices = [
  {
    title: "Keyboard navigation",
    body: "Every menu, dialog, and preview can be reached and operated without a mouse.",
  },
  {
    title: "Visible focus indicators",
    body: "A clear outline marks the current control as you tab through the page.",
  },
  {
    title: "Semantic HTML",
    body: "Headings, lists, landmarks, and a skip link give screen readers a clear outline.",
  },
  {
    title: "High-contrast text",
    body: "Ink on warm white, with accent colour kept to small details rather than essential text.",
  },
  {
    title: "Reduced-motion support",
    body: "Reveal animations, glowing trails, and smooth scrolling switch off when your system asks for less motion.",
  },
  {
    title: "Screen-reader-friendly controls",
    body: "Icon-only buttons carry labels, and the preview gallery announces which screen you are viewing.",
  },
  {
    title: "Responsive text and targets",
    body: "Type scales with the viewport, and primary controls stay at least 44 pixels tall for easier tapping.",
  },
  {
    title: "Honest product claims",
    body: "Features that are not in the release are labelled as such. No certification or validation is implied.",
  },
];

export function Trust() {
  return (
    <section
      id="accessibility"
      aria-labelledby="accessibility-heading"
      className="border-t border-border/80 py-20 md:py-28"
    >
      <div className="shell grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
        <div>
          <SectionHeading
            index="06"
            label="Accessibility and trust"
            title={
              <span id="accessibility-heading">
                Designed with
                <span className="italic"> accessibility in mind.</span>
              </span>
            }
            lede="Accessibility is part of the build, not a finishing touch. Here is what this site actually does — and what it does not claim."
          />

          <Reveal className="mt-10" delay={60}>
            <div className="rounded-lg border border-border bg-muted/40 p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AlertTriangle
                  className="h-4 w-4 text-ink-soft"
                  aria-hidden="true"
                />
                A note on safety
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Jonaki is an assistive tool. It is not a replacement for a white
                cane, a guide dog, or professional mobility training. Object
                detection can miss hazards, and spoken or vibration alerts can
                be delayed, incomplete, or wrong.
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Always use the mobility aids and techniques that are right for
                you, and use your own judgement about what is ahead. Jonaki is
                not a medical device, and no accessibility certification or
                clinical validation is claimed.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {practices.map((practice) => (
              <li key={practice.title} className="bg-background p-5">
                <p className="flex items-start gap-2 text-sm font-medium leading-snug text-foreground">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft"
                    aria-hidden="true"
                  />
                  {practice.title}
                </p>
                <p className="mt-2 pl-6 text-xs leading-5 text-muted-foreground">
                  {practice.body}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs leading-6 text-muted-foreground">
            This website has not been formally audited against WCAG. The list
            above describes the accessibility work built into these pages, not a
            compliance certificate. If something here blocks you, please report
            it once a support contact is published.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
