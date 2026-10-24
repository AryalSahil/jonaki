import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";

import { DownloadButton } from "@/components/site/ApkDownload";
import { JonakiMark, Wordmark } from "@/components/site/Brand";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const links = [
  { href: "#home", id: "home", label: "Home" },
  { href: "#features", id: "features", label: "Features" },
  { href: "#how-it-works", id: "how-it-works", label: "How it works" },
  { href: "#accessibility", id: "accessibility", label: "Accessibility" },
  { href: "#faq", id: "faq", label: "FAQ" },
];

/** Cross-page links that navigate away from the landing page. */
const pageLinks = [
  { to: "/feedback", label: "Feedback" },
  { to: "/contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const onLanding = location.pathname === "/";

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 12);
      const marker = window.scrollY + 140;
      let current = "home";
      for (const link of links) {
        const section = document.getElementById(link.id);
        if (section && section.offsetTop <= marker) current = link.id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled
          ? "border-b border-border/80 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="shell flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
        <a
          href="#home"
          className="flex items-center gap-2.5 rounded-sm py-2"
          aria-label="Jonaki — back to top"
        >
          <JonakiMark className="h-7 w-7 text-foreground" />
          <Wordmark />
        </a>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {(onLanding ? links : [{ href: "/", id: "home", label: "Home" }]).map(
              (link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={
                      onLanding && active === link.id ? "location" : undefined
                    }
                    className={cn(
                      "inline-flex min-h-9 items-center rounded-sm text-[0.8125rem] tracking-[-0.005em] transition-colors",
                      onLanding && active === link.id
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ),
            )}
            {pageLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  aria-current={
                    location.pathname === link.to ? "page" : undefined
                  }
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-sm text-[0.8125rem] tracking-[-0.005em] transition-colors",
                    location.pathname === link.to
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <DownloadButton
            label="Download APK"
            variant="solid"
            className="min-h-10 px-4 py-2 text-[0.8125rem]"
          />
        </div>

        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            className="mobile-menu fixed inset-x-0 top-0 left-0 max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-b border-border bg-background p-0 shadow-none data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-none"
            aria-describedby="mobile-menu-description"
          >
            <DialogTitle className="sr-only">Site navigation</DialogTitle>
            <DialogDescription id="mobile-menu-description" className="sr-only">
              Links to the main sections of the Jonaki page, and the Android
              download.
            </DialogDescription>

            <div className="flex h-16 items-center justify-between px-5">
              <a
                href="#home"
                className="flex items-center gap-2.5"
                onClick={() => setMenuOpen(false)}
              >
                <JonakiMark className="h-7 w-7 text-foreground" />
                <Wordmark />
              </a>
              <DialogClose asChild>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-md border border-border"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </DialogClose>
            </div>

            <nav
              aria-label="Mobile"
              className="border-t border-border px-5 pb-6"
            >
              <ul>
                {(onLanding
                  ? [
                      ...links.map((l) => ({ label: l.label, to: l.href })),
                      ...pageLinks.map((l) => ({ label: l.label, to: l.to })),
                    ]
                  : [
                      { label: "Home", to: "/" },
                      ...pageLinks.map((l) => ({ label: l.label, to: l.to })),
                    ]
                ).map((link, index) => (
                  <li key={link.to} className="border-b border-border/70">
                    {link.to.startsWith("#") ? (
                      <a
                        href={link.to}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-14 items-center justify-between py-3 text-base text-foreground"
                      >
                        {link.label}
                        <span
                          aria-hidden="true"
                          className="text-xs text-muted-foreground"
                        >
                          0{index + 1}
                        </span>
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        aria-current={
                          location.pathname === link.to ? "page" : undefined
                        }
                        className="flex min-h-14 items-center justify-between py-3 text-base text-foreground"
                      >
                        {link.label}
                        <span
                          aria-hidden="true"
                          className="text-xs text-muted-foreground"
                        >
                          0{index + 1}
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <a
                  href="#download"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-ink-soft"
                >
                  Download APK
                </a>
              </div>
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
