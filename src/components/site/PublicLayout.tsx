import type { ReactNode } from "react";
import { Link } from "react-router";

import { JonakiMark, Wordmark } from "@/components/site/Brand";
import { usePublicState } from "@/lib/site";

/**
 * Wraps every public page. While the database reports maintenance mode, it
 * replaces the page with an accessible maintenance screen. Administrators who
 * are signed in are not blocked — they keep full access to /admin (verified
 * server-side on every admin action, not just here).
 *
 * This is the client half of maintenance mode. The server half is enforced in
 * the mutation/query layer: submissions and downloads are rejected server-side
 * while maintenance is on, so hiding the UI is never the only protection.
 */
export function PublicLayout({
  children,
  withNav = true,
  withFooter = true,
}: {
  children: ReactNode;
  withNav?: boolean;
  withFooter?: boolean;
}) {
  const state = usePublicState();

  if (state?.maintenance) {
    return <MaintenanceScreen message={state.maintenance.message} reopenAt={state.maintenance.reopenAt} />;
  }

  return <>{children}</>;
}

function MaintenanceScreen({
  message,
  reopenAt,
}: {
  message: string;
  reopenAt: number | null;
}) {
  const reopenDate = reopenAt ? new Date(reopenAt) : null;
  const reopenLabel =
    reopenDate && !Number.isNaN(reopenDate.getTime())
      ? reopenDate.toLocaleString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <a
        href="/"
        className="flex items-center gap-2.5 rounded-sm"
        aria-label="Jonaki home"
      >
        <JonakiMark className="h-9 w-9 text-foreground" />
        <Wordmark />
      </a>

      <main className="mt-12 max-w-md">
        <p className="eyebrow flex items-center justify-center gap-3 text-muted-foreground">
          <span aria-hidden="true" className="inline-block h-px w-8 bg-border" />
          Maintenance
          <span aria-hidden="true" className="inline-block h-px w-8 bg-border" />
        </p>
        <h1 className="text-display mt-6 text-[clamp(2rem,5vw,3rem)] text-foreground">
          We&apos;ll be back shortly.
        </h1>
        <p className="mt-5 text-[0.975rem] leading-7 text-muted-foreground">
          {message ||
            "Jonaki is temporarily offline for maintenance. Please check back a little later."}
        </p>

        {reopenLabel ? (
          <p className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
            Expected back around{" "}
            <span className="font-medium text-foreground">{reopenLabel}</span>.
          </p>
        ) : null}

        <p className="mt-8 text-xs leading-5 text-muted-foreground/80">
          Downloads and feedback submissions are paused while maintenance is
          running. Thank you for your patience.
        </p>
      </main>

      <footer className="mt-16 text-center text-xs text-muted-foreground/70">
        <p>
          A little light in every step.
        </p>
      </footer>
    </div>
  );
}

/**
 * Small helper so pages can link home from the maintenance screen and 404.
 */
export function HomeLink({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={
        className ??
        "inline-flex min-h-11 items-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-ink-soft"
      }
    >
      Back to the homepage
    </Link>
  );
}
