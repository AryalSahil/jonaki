import { useState } from "react";
import { Link, useLocation } from "react-router";
import { ArrowUp } from "lucide-react";

import {
  DownloadButton,
  InstallInstructionsLink,
} from "@/components/site/ApkDownload";
import { JonakiMark, Wordmark } from "@/components/site/Brand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { site } from "@/config/site";
import { usePublicState, useReleaseState } from "@/lib/site";

const exploreLinks = [
  { href: "#home", label: "Home" },
  { href: "#mission", label: "Mission" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#preview", label: "App preview" },
  { href: "#accessibility", label: "Accessibility" },
  { href: "#faq", label: "FAQ" },
];

type LegalDocument = "privacy" | "terms";

const legalCopy: Record<
  LegalDocument,
  { title: string; description: string; body: string }
> = {
  privacy: {
    title: "Privacy policy",
    description: "No privacy policy has been published for Jonaki yet.",
    body: "This website does not include accounts, forms, analytics, advertising, or tracking pixels, and it does not ask for camera, microphone, or location access. That description of the site is not a substitute for a published policy. An official privacy policy will be linked here before the APK is distributed, and the document will cover the Android app's own data handling.",
  },
  terms: {
    title: "Terms of use",
    description: "No terms of use have been published for Jonaki yet.",
    body: "There are no legal terms on this page, and nothing here should be read as one. Terms covering the website and the Android app will be published and linked here before the APK is distributed.",
  },
};

export function Footer() {
  const year = new Date().getFullYear();
  const [legal, setLegal] = useState<LegalDocument | null>(null);
  const document = legal ? legalCopy[legal] : null;
  const location = useLocation();
  const onLanding = location.pathname === "/";
  const state = usePublicState();
  const release = useReleaseState();
  const supportEmail = state?.supportEmail || null;

  // Database-backed privacy/terms take priority over the not-published dialog.
  const privacyText = state?.content.privacyPolicy ?? null;
  const termsText = state?.content.termsOfUse ?? null;

  const versionLabel = release?.release?.version
    ? `Jonaki for Android · Version ${release.release.version}`
    : "Jonaki for Android · Release details published with each build";

  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="shell py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12">
          <div>
            <a
              href="#home"
              className="inline-flex items-center gap-2.5 rounded-sm"
              aria-label="Jonaki — back to top"
            >
              <JonakiMark className="h-8 w-8 text-foreground" />
              <Wordmark />
            </a>
            <p className="mt-5 flex items-center gap-2 font-display text-lg italic text-ink-soft">
              {site.tagline}
              <span
                aria-hidden="true"
                className="mt-1 inline-block h-1 w-1 rounded-full bg-gold"
              />
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
              {site.mission}
            </p>
          </div>

          <nav aria-labelledby="footer-explore">
            <h3 id="footer-explore" className="eyebrow text-muted-foreground">
              Explore
            </h3>
            <ul className="mt-5 space-y-3">
              {(onLanding
                ? exploreLinks.map((l) => ({ label: l.label, to: l.href }))
                : [
                    { label: "Home", to: "/" },
                    { label: "Feedback", to: "/feedback" },
                    { label: "Contact", to: "/contact" },
                  ]
              ).map((link) =>
                link.to.startsWith("#") ? (
                  <li key={link.to}>
                    <a
                      href={link.to}
                      className="inline-flex min-h-6 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="inline-flex min-h-6 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <nav aria-labelledby="footer-download">
            <h3 id="footer-download" className="eyebrow text-muted-foreground">
              Get Jonaki
            </h3>
            <div className="mt-5 space-y-4">
              <DownloadButton
                variant="outline"
                label="Download APK"
                className="min-h-9 px-3 py-1.5 text-xs"
              />
              <div>
                <InstallInstructionsLink className="text-xs" />
              </div>
              <a
                href="#download"
                className="inline-flex min-h-6 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Release details
              </a>
            </div>
          </nav>

          <nav aria-labelledby="footer-more">
            <h3 id="footer-more" className="eyebrow text-muted-foreground">
              More
            </h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/feedback"
                  className="inline-flex min-h-6 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Report a bug
                </Link>
              </li>
              <li>
                <Link
                  to="/feedback"
                  className="inline-flex min-h-6 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Suggest a feature
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="inline-flex min-h-6 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {supportEmail ? "Contact" : "Contact form"}
                </Link>
              </li>
              {supportEmail ? (
                <li>
                  <a
                    href={`mailto:${supportEmail}`}
                    className="inline-flex min-h-6 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {supportEmail}
                  </a>
                </li>
              ) : null}
              <li>
                {privacyText ? (
                  <button
                    type="button"
                    onClick={() => setLegal("privacy")}
                    aria-haspopup="dialog"
                    className="inline-flex min-h-6 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Privacy policy
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLegal("privacy")}
                    aria-haspopup="dialog"
                    className="inline-flex min-h-6 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Privacy policy
                  </button>
                )}
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegal("terms")}
                  aria-haspopup="dialog"
                  className="inline-flex min-h-6 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Terms of use
                </button>
              </li>
              <li>
                <a
                  href="#home"
                  className="inline-flex min-h-6 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Back to top
                  <ArrowUp className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Jonaki. All rights reserved.</p>
          <p>{versionLabel}</p>
        </div>

        <p className="mt-4 max-w-3xl text-[0.7rem] leading-5 text-muted-foreground/80">
          Jonaki is an assistive aid, not a replacement for a white cane, a
          guide dog, or professional mobility training. Object detection can
          miss hazards.
        </p>
      </div>

      <Dialog
        open={legal !== null}
        onOpenChange={(open) => {
          if (!open) setLegal(null);
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto shadow-none">
          {document ? (
            <>
              <DialogHeader>
                <span className="eyebrow text-muted-foreground">Legal</span>
                <DialogTitle className="text-display text-2xl">
                  {document.title}
                </DialogTitle>
                <DialogDescription>{document.description}</DialogDescription>
              </DialogHeader>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {legal === "privacy" && privacyText
                  ? privacyText
                  : legal === "terms" && termsText
                    ? termsText
                    : document.body}
              </p>
              {supportEmail ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Questions can be sent to{" "}
                  <a
                    href={`mailto:${supportEmail}`}
                    className="font-medium text-ink-soft underline decoration-1 underline-offset-4"
                  >
                    {supportEmail}
                  </a>
                  .
                </p>
              ) : null}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="h-10 px-4">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </footer>
  );
}
