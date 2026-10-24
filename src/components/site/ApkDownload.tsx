import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  Settings2,
  Wrench,
} from "lucide-react";

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
import { formatDate, useReleaseState } from "@/lib/site";
import { cn } from "@/lib/utils";

export type ApkState =
  | "loading"
  | "ready"
  | "pending"
  | "maintenance"
  | "external";

/**
 * One shared release lookup for every download button on the page. The state
 * comes from the database (published release + maintenance settings), so the
 * buttons can never point at a file that is not published. When the site
 * owner configures `VITE_JONAKI_APK_URL` for an external release host, that
 * URL is used instead of the managed download endpoint.
 */
function useApkState(): {
  state: ApkState;
  release: NonNullable<ReturnType<typeof useReleaseState>>["release"];
} {
  const data = useReleaseState();

  if (site.release.apkUrl) {
    return { state: "external", release: data?.release ?? null };
  }
  if (data === undefined) {
    return { state: "loading", release: null };
  }
  if (data.maintenance?.downloadsBlocked) {
    return { state: "maintenance", release: data.release ?? null };
  }
  if (!data.release) {
    return { state: "pending", release: null };
  }
  return { state: "ready", release: data.release };
}

const buttonStyles = {
  solid:
    "bg-foreground text-background hover:bg-ink-soft focus-visible:outline-foreground",
  inverted:
    "bg-gold text-[#141109] hover:bg-gold/90 focus-visible:outline-foreground",
  outline: "border border-border bg-transparent text-foreground hover:bg-muted",
} as const;

const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-md px-6 py-3 text-sm font-medium tracking-[-0.01em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70";

export function downloadHref(release: { version: string } | null): string {
  if (site.release.apkUrl) return site.release.apkUrl;
  if (!release) return "#";
  return "/download/latest.apk";
}

function downloadFilename(
  release: { version: string } | null,
): string | undefined {
  if (!release) return undefined;
  const version = release.version.replace(/^v/i, "");
  return `Jonaki-Android-v${version}.apk`;
}

export function DownloadButton({
  className,
  label = "Download Jonaki APK",
  variant = "solid",
}: {
  className?: string;
  label?: string;
  variant?: keyof typeof buttonStyles;
}) {
  const { state, release } = useApkState();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"availability" | "install">("availability");
  const classes = cn(buttonBase, buttonStyles[variant], className);
  const filename = downloadFilename(release);
  const screenReaderSuffix = /android/i.test(label) ? null : (
    <span className="sr-only"> for Android</span>
  );

  if (state === "loading") {
    return (
      <button type="button" className={classes} disabled aria-busy="true">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Checking the release…
      </button>
    );
  }

  if (state === "ready" || state === "external") {
    return (
      <a
        href={downloadHref(release)}
        download={filename}
        rel="noopener"
        className={classes}
        data-apk-state="ready"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {label}
        {screenReaderSuffix}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        className={classes}
        onClick={() => {
          setMode("availability");
          setOpen(true);
        }}
        aria-haspopup="dialog"
        data-apk-state={state}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {label}
        {screenReaderSuffix}
      </button>

      <ReleaseDialog
        open={open}
        onOpenChange={setOpen}
        mode={mode}
        onShowInstall={() => setMode("install")}
        state={state}
        maintenanceMessage={null}
      />
    </>
  );
}

export function InstallInstructionsLink({
  className,
  inverted = false,
  label = "Installation instructions",
}: {
  className?: string;
  inverted?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 text-sm font-medium underline decoration-1 underline-offset-[6px] transition-opacity hover:opacity-70",
          inverted
            ? "text-navy-foreground/80 focus-visible:outline-foreground"
            : "text-ink-soft",
          className,
        )}
      >
        {label}
        <span className="sr-only"> (opens a help dialog)</span>
      </button>

      <ReleaseDialog
        open={open}
        onOpenChange={setOpen}
        mode="install"
        onShowInstall={() => undefined}
        state="pending"
        maintenanceMessage={null}
      />
    </>
  );
}

function InstallSteps() {
  const steps = [
    {
      title: "Download the APK",
      body: "Use a download button on this page in Chrome or your usual Android browser. You are downloading an Android app package (.apk), not an app-store install.",
    },
    {
      title: "Open the downloaded file",
      body: "When the download finishes, open it from your browser's downloads list, or from the Files app on your phone.",
    },
    {
      title: "Allow this source, if Android asks",
      body: "Android may say your phone is not allowed to install unknown apps from this source. Tap Settings, turn on the allowance for that browser or file manager, then go back. This is Android's standard protection for apps installed outside an app store.",
    },
    {
      title: "Install, then open",
      body: "Tap Install. If Play Protect shows a prompt about an app it does not recognise, review it and continue only if you downloaded Jonaki from the official link on this page.",
    },
    {
      title: "Turn the allowance back off",
      body: "In Android Settings → Apps → Special app access → Install unknown apps, you can switch the allowance off again once Jonaki is installed.",
    },
  ];

  return (
    <>
      <ol className="mt-6 space-y-5">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-[0.7rem] font-medium text-muted-foreground"
            >
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                {step.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 space-y-3 rounded-md border border-border bg-muted/50 p-4">
        <p className="flex gap-2 text-sm leading-6 text-ink-soft">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Only install the official release linked from this page. Do not
            install an APK sent to you by message or a file-sharing link.
          </span>
        </p>
        <p className="flex gap-2 text-sm leading-6 text-muted-foreground">
          <Settings2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Jonaki asks for camera access when you start walking assistance. You
            can review or revoke that permission at any time in Android
            settings.
          </span>
        </p>
      </div>
    </>
  );
}

function ReleaseDialog({
  open,
  onOpenChange,
  mode,
  onShowInstall,
  state,
  maintenanceMessage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "availability" | "install";
  onShowInstall: () => void;
  state: ApkState;
  maintenanceMessage: string | null;
}) {
  const pending = state === "pending";
  const isInstall = mode === "install";
  const maintenance = state === "maintenance";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-xl gap-0 overflow-y-auto p-6 shadow-none sm:p-7">
        <DialogHeader className="gap-3 text-left">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-border px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {isInstall ? (
              <Settings2 className="h-3 w-3" aria-hidden="true" />
            ) : maintenance ? (
              <Wrench className="h-3 w-3" aria-hidden="true" />
            ) : pending ? (
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            )}
            {isInstall
              ? "Install help"
              : maintenance
                ? "Maintenance"
                : pending
                  ? "Release pending"
                  : "Release available"}
          </span>
          <DialogTitle className="text-display text-2xl leading-tight sm:text-[1.75rem]">
            {isInstall
              ? "How to install Jonaki on Android"
              : maintenance
                ? "Downloads are paused for maintenance."
                : "The Android release isn’t published yet."}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6">
            {isInstall
              ? "Android installs apps from outside an app store in a few extra steps. Here is what to expect, and how to stay safe."
              : maintenance
                ? "Jonaki is temporarily in maintenance mode, so the APK is not being served right now. Nothing was downloaded."
                : "The website is ready, but no APK has been published by the site administrator yet. Nothing was downloaded."}
          </DialogDescription>
        </DialogHeader>

        {isInstall ? (
          <InstallSteps />
        ) : (
          <div className="mt-6 space-y-3 rounded-md border border-border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
            {maintenance ? (
              <p>
                {maintenanceMessage ||
                  "The site is in maintenance mode. Downloads will work again as soon as maintenance ends."}
              </p>
            ) : (
              <>
                <p>
                  When the site administrator uploads and publishes a signed
                  build from the admin dashboard, the download buttons here will
                  serve that exact file — with its real version, size, release
                  date, and a server-calculated checksum. This page never links
                  to a placeholder APK or shows a simulated download.
                </p>
                <p>
                  You can read the installation instructions in the meantime so
                  you know what to expect.
                </p>
              </>
            )}
          </div>
        )}

        <DialogFooter className="mt-7 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="h-10 px-4">
              Close
            </Button>
          </DialogClose>
          {!isInstall ? (
            <Button type="button" className="h-10 px-4" onClick={onShowInstall}>
              Installation instructions
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Short, honest release state line used near download calls-to-action. */
export function ApkStatusLine({
  inverted = false,
  className,
  live = true,
}: {
  inverted?: boolean;
  className?: string;
  live?: boolean;
}) {
  const { state, release } = useApkState();

  const message =
    state === "loading"
      ? "Checking the latest published release…"
      : state === "maintenance"
        ? "Downloads are paused while the site is in maintenance mode."
        : state === "pending"
          ? "No APK has been published yet. The download button explains what to expect."
          : release
            ? `Version ${release.version} · ${release.fileSizeLabel} · published ${formatDate(release.releaseDate)}`
            : "Download comes from the official release link.";

  return (
    <p
      className={cn(
        "text-xs leading-5",
        inverted ? "text-navy-foreground/70" : "text-muted-foreground",
        className,
      )}
      role={live ? "status" : undefined}
    >
      {message}
    </p>
  );
}
