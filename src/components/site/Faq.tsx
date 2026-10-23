import { Mail } from "lucide-react";

import { InstallInstructionsLink } from "@/components/site/ApkDownload";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { hasContact, site } from "@/config/site";

export function Faq() {
  const faqs: { question: string; answer: React.ReactNode }[] = [
    {
      question: "What is Jonaki?",
      answer:
        "Jonaki is an Android walking assistant. It uses the phone's camera to look for supported visible objects, then speaks a short alert and, if you enable it, vibrates. The app also includes pedestrian navigation with spoken directions, hands-free voice commands, and an emergency help screen. It is designed as an extra source of information for blind and low-vision users — not as a replacement for existing mobility tools.",
    },
    {
      question: "Who can use it?",
      answer:
        "Jonaki is intended for blind and visually impaired Android users, as well as family members, volunteers, and organisations helping someone set it up. It needs an Android phone with a working camera and speaker; voice commands need a microphone, and navigation and location sharing need location access. The minimum Android version is listed in the download section once a release is published.",
    },
    {
      question: "How do I download the Android APK?",
      answer: (
        <>
          Use a download button on this page. It points only to the official APK
          file configured by the Jonaki team, and no account is needed. While
          the APK has not been published, the button says so and nothing is
          downloaded. See the{" "}
          <a
            href="#download"
            className="font-medium text-ink-soft underline decoration-1 underline-offset-4 hover:opacity-70"
          >
            download section
          </a>{" "}
          for the current release state.
        </>
      ),
    },
    {
      question: "How do I install an APK on Android?",
      answer: (
        <>
          Open the downloaded file from your downloads list or the Files app.
          Android may ask you to allow installs from that browser or file
          manager: tap Settings, turn on the allowance, go back, then tap
          Install. You can switch the allowance off again afterwards. Only
          install the official release linked from this page.{" "}
          <InstallInstructionsLink
            className="align-baseline text-xs"
            label="Read the full installation instructions"
          />
        </>
      ),
    },
    {
      question: "Does Jonaki require an internet connection?",
      answer:
        "Downloading the APK needs a connection. Walking assistance and spoken alerts work from the phone's camera and speaker. Pedestrian navigation uses GPS and OpenStreetMap map data, which may need a connection for maps, and emergency location sharing may need mobile data or Wi-Fi. Check the release notes for your build for the exact behaviour.",
    },
    {
      question: "Which Android versions are supported?",
      answer:
        "The supported Android versions are published with each release. If no minimum version is shown on this page, it has not been verified yet — check the release notes before installing instead of assuming your phone is supported.",
    },
    {
      question: "Does it replace a white cane or guide dog?",
      answer:
        "No. Jonaki is an assistive aid only. It can miss objects, and its alerts may be late or wrong. Keep using your cane, guide dog, and the mobility techniques you rely on, and treat each alert as additional information rather than a guarantee.",
    },
    {
      question: "How does Jonaki use camera and location permissions?",
      answer:
        "Camera access is used while walking assistance is active, to look for supported objects. Microphone access is used for voice commands and scene questions. Location is optional and is requested when you use pedestrian navigation or emergency location sharing. Android asks before each permission is granted, Jonaki explains what it is for, and you can decline or revoke any of them in Android settings. This website itself requests no camera, microphone, or location access.",
    },
    {
      question: "Where can I report a problem?",
      answer: hasContact() ? (
        <>
          Email{" "}
          <a
            href={`mailto:${site.contactEmail}`}
            className="font-medium text-ink-soft underline decoration-1 underline-offset-4 hover:opacity-70"
          >
            {site.contactEmail}
          </a>{" "}
          with your Android version, phone model, and what happened. Please
          avoid including personal information you do not need to share.
        </>
      ) : (
        "A support address has not been published on this site yet. Until an official contact is added, please do not send device details to an address you cannot verify."
      ),
    },
  ];

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="border-t border-border/80 py-20 md:py-28"
    >
      <div className="shell grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            index="07"
            label="FAQ"
            title={
              <span id="faq-heading">
                Questions,
                <span className="italic"> answered honestly.</span>
              </span>
            }
          />

          <Reveal className="mt-8" delay={80}>
            <div className="rounded-lg border border-border bg-muted/40 p-5">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Mail className="h-4 w-4 text-ink-soft" aria-hidden="true" />
                Still unsure?
              </p>
              {hasContact() ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Write to{" "}
                  <a
                    href={`mailto:${site.contactEmail}`}
                    className="font-medium text-ink-soft underline decoration-1 underline-offset-4"
                  >
                    {site.contactEmail}
                  </a>
                  .
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  An official support address has not been published yet. When
                  it is added, it will appear here and in the footer.
                </p>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal>
          <Accordion
            type="single"
            collapsible
            className="border-t border-border"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`faq-${index}`}
                className="border-b border-border"
              >
                <AccordionTrigger className="gap-6 py-5 text-left text-[0.95rem] font-medium text-foreground hover:no-underline data-[state=open]:text-ink-soft [&>svg]:text-muted-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="max-w-2xl pr-8 pb-5 text-sm leading-6 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
