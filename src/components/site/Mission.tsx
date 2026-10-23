import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";

const values = [
  {
    index: "01",
    title: "Greater awareness of detected objects",
    body: "Short, specific descriptions of supported visible objects in the camera view — with the limits of the model stated plainly.",
  },
  {
    index: "02",
    title: "Hands-free, spoken feedback",
    body: "Alerts play through the phone speaker or headphones, so your hands stay free for your cane and your attention stays on the pavement.",
  },
  {
    index: "03",
    title: "Accessibility at the centre",
    body: "A phone-first approach that asks only for the permissions it uses, explains them, and keeps the interface quiet, legible, and predictable.",
  },
];

export function Mission() {
  return (
    <section
      id="mission"
      aria-labelledby="mission-heading"
      className="border-t border-border/80 py-20 md:py-28"
    >
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <SectionHeading
            index="01"
            label="Mission and purpose"
            title={
              <span id="mission-heading">
                Technology that helps make
                <span className="italic"> every step count.</span>
              </span>
            }
          />

          <Reveal className="space-y-5 text-[0.975rem] leading-7 text-muted-foreground sm:text-base sm:leading-8">
            <p>
              Moving through a familiar street can still mean navigating bins,
              parked scooters, café chairs, and people who step out without
              warning. For people with little or no sight, that information
              often arrives late, or not at all.
            </p>
            <p>
              Jonaki puts a second set of eyes in the phone already in your
              hand. It watches the camera view, notices supported visible
              objects, and says what it sees in a few quiet words — giving you
              more time to decide what to do next.
            </p>
            <p className="text-ink-soft">
              We are careful about what we claim. Jonaki is an assistive aid,
              not a guarantee. Detection can miss things, and an alert can be
              late or wrong. The aim is simply to add useful information to the
              walk you already know how to make.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {values.map((value, index) => (
            <Reveal
              key={value.index}
              delay={index * 80}
              className="bg-background p-6 sm:p-7"
            >
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {value.index}
              </p>
              <h3 className="mt-5 text-base font-medium leading-snug text-foreground">
                {value.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {value.body}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <span className="eyebrow mr-1 text-muted-foreground">Made for</span>
          <span>Blind and low-vision Android users</span>
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <span>Families and volunteers</span>
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <span>Accessibility organisations</span>
        </Reveal>
      </div>
    </section>
  );
}
