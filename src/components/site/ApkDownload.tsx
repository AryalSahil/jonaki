import { useEffect, useState, useSyncExternalStore } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  Settings2,
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
import { cn } from "@/lib/utils";

type ApkState = "unconfigured" | "checking" | "ready" | "unavailable";

/**
 * One shared availability probe for every download button on the page.
 * Same-origin links are checked with HEAD so a missing file or an HTML error
 * page is reported to the visitor instead of downloading a broken response.
 * External release hosts cannot be probed from the browser (CORS), so they are
 * treated as configured and linked directly.
 */
const apkStore = (() => {
  const url = site.release.apkUrl;
  let state: ApkState = !url
    ? "unconfigured"
    : url.startsWith("/")
      ? "checking"
      : "ready";
  let started = false;
  const listeners = new Set<() => void>();

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const verify = async (target: string) => {
    try {
      const response = await fetch(target, {
        method: "HEAD",
        cache: "no-store",
      });
      const contentType = (
        response.headers.get("content-type") ?? ""
      ).toLowerCase();
      const servesAppFile = !contentType.includes("text/html");
      state = response.ok && servesAppFile ? "ready" : "unavailable";
    } catch {
      state = "unavailable";
    }
    emit();
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getState() {
      return state;
    },
    start(force = false) {
      const target = site.release.apkUrl;
      if (!target) {
        state = "unconfigured";
        emit();
        return;
      }
      if (!target.startsWith("/")) {
        state = "ready";
        emit();
        return;
      }
      if (started && !force) return;
      started = true;
      state = "checking";
      emit();
      void verify(target);
    },
  };
})();

function useApkState() {
  const state = useSyncExternalStore(
    apkStore.subscribe,
    apkStore.getState,
    apkStore.getState,
  );

  useEffect(() => {
    apkStore.start();
  }, []);

  return { state, retry: () => apkStore.start(true) };
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

const apkFilename = () =>
  site.release.version
    ? `Jonaki-Android-v${site.release.version.replace(/^v/i, "")}.apk`
    : undefined;

export function DownloadButton({
  className,
  label = "Download Jonaki APK",
  variant = "solid",
}: {
  className?: string;
  label?: string;
  variant?: keyof typeof buttonStyles;
}) {
  const { state, retry } = useApkState();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"availability" | "install">("availability");
  const classes = cn(buttonBase, buttonStyles[variant], className);
  const filename = apkFilename();
  const screenReaderSuffix = /android/i.test(label) ? null : (
    <span className="sr-only"> for Android</span>
  );

  if (state === "ready") {
    return (
      <a
        href={site.release.apkUrl}
        download={filename}
        className={classes}
        data-apk-state="ready"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {label}
        {screenReaderSuffix}
      </a>
    );
  }

  if (state === "checking") {
    return (
      <button type="button" className={classes} disabled aria-busy="true">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Checking the release…
      </button>
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
        onRetry={retry}
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
        state="unconfigured"
        onRetry={() => undefined}
      />
    </>
  );
}

function InstallSteps() {
  const steps = [
    {
      title: "Download the APK",
      body: "Use the download button on this page in Chrome or your usual Android browser. You are downloading an Android app package (.apk), not an app-store install.",
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
  onRetry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "availability" | "install";
  onShowInstall: () => void;
  state: ApkState;
  onRetry: () => void;
}) {
  const pending = state === "unconfigured";
  const checking = state === "checking";
  const available = state === "ready";
  const isInstall = mode === "install";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-xl gap-0 overflow-y-auto p-6 shadow-none sm:p-7">
        <DialogHeader className="gap-3 text-left">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-border px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {pending ? (
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
            ) : available ? (
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
            )}
            {isInstall
              ? "Install help"
              : pending
                ? "Release pending"
                : available
                  ? "Release available"
                  : "Temporarily unavailable"}
          </span>
          <DialogTitle className="text-display text-2xl leading-tight sm:text-[1.75rem]">
            {isInstall
              ? "How to install Jonaki on Android"
              : pending
                ? "The Android release isn’t published yet."
                : available
                  ? "Jonaki is ready to download."
                  : "That APK isn’t available right now."}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6">
            {isInstall
              ? "Android installs apps from outside an app store in a few extra steps. Here is what to expect, and how to stay safe."
              : pending
                ? "The website is ready, but the APK has not been added to the download link yet. Nothing was downloaded."
                : available
                  ? "Use the download button to get the official APK file."
                  : "The configured download link could not be reached, or it returned a web page instead of an Android app file. Nothing was downloaded."}
          </DialogDescription>
        </DialogHeader>

        {isInstall ? (
          <InstallSteps />
        ) : available ? (
          <div className="mt-6">
            <a
              href={site.release.apkUrl}
              download={apkFilename()}
              className={cn(buttonBase, buttonStyles.solid, "w-full")}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download the APK
            </a>
          </div>
        ) : pending || checking ? (
          <div className="mt-6 space-y-3 rounded-md border border-border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
            <p>
              {checking
                ? "Checking the release link now. This only takes a moment."
                : "This page never links to a placeholder APK or shows a simulated download. When the first public build is published, the download buttons here will point straight to the official file."}
            </p>
            {!checking ? (
              <p>
                You can read the installation instructions in the meantime so
                you know what to expect.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 space-y-3 rounded-md border border-border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
            <p>
              This usually means the release link is missing, has moved, or is
              temporarily offline. Try again in a moment.
            </p>
            <p>
              <button
                type="button"
                onClick={onRetry}
                className="font-medium text-foreground underline decoration-1 underline-offset-4 hover:opacity-70"
              >
                Check the link again
              </button>
            </p>
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
  const { state } = useApkState();

  const message =
    state === "unconfigured"
      ? "The Android APK has not been published yet. The download button explains what to expect."
      : state === "checking"
        ? "Checking the official release link…"
        : state === "unavailable"
          ? "The configured APK link is currently unreachable. No placeholder file is offered."
          : "Download comes from the official release link. Android may ask for permission to install it.";

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
