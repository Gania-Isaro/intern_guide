"use client";

// The global error boundary (A8). If any page crashes while rendering,
// Next.js swaps in this screen instead of a blank page - and the "Try
// again" button re-renders the page that failed.

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-24 px-4 text-center space-y-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-ink-secondary">
        The page hit an unexpected error. It&apos;s not you - trying again
        usually fixes it.
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <Button size="sm" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="secondary" size="sm">
          <a href="/">Go to the homepage</a>
        </Button>
      </div>
    </div>
  );
}