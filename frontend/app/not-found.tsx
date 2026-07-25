// The 404 page (A8). Next.js shows this automatically for any URL that
// doesn't exist - no wiring needed, the file name is the wiring.

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-24 px-4 text-center space-y-4">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="text-2xl font-bold">This page doesn&apos;t exist</h1>
      <p className="text-ink-secondary">
        The link may be old, or the address was mistyped. Nothing is broken -
        the page just isn&apos;t here.
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <Button asChild size="sm">
          <Link href="/">Go to the homepage</Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/companies">Browse companies</Link>
        </Button>
      </div>
    </div>
  );
}