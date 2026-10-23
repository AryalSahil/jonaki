import { ArrowLeft } from "lucide-react";

import { JonakiMark, Wordmark } from "@/components/site/Brand";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <div className="flex items-center gap-2.5">
        <JonakiMark className="h-8 w-8 text-foreground" />
        <Wordmark />
      </div>

      <p className="eyebrow mt-12 text-muted-foreground">Page not found</p>
      <h1 className="text-display mt-5 max-w-lg text-[clamp(2.2rem,6vw,3.4rem)]">
        This path doesn’t lead anywhere.
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
        The page you were looking for may have moved. Head back to the Jonaki
        home page to keep exploring.
      </p>

      <a
        href="/"
        className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-ink-soft"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to home
      </a>
    </main>
  );
}
