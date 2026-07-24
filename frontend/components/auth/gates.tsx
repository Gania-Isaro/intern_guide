"use client";

// Two small building blocks the role-protected pages share, so every page
// treats the two situations the same way:
//
//   RedirectToLogin - the visitor is NOT logged in. Logging in fixes it, so we
//                     send them to /login and remember where they were going.
//   NotAllowed      - the visitor IS logged in but with the wrong role. Logging
//                     in again would not help, so we explain it instead of
//                     bouncing them around.

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/states";

export function RedirectToLogin() {
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    router.replace(`/login?from=${encodeURIComponent(pathname)}`);
  }, [router, pathname]);

  return <LoadingState label="Taking you to the login page…" />;
}

export function NotAllowed({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-3 py-16 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-ink-secondary">{text}</p>
      <Button asChild variant="secondary" size="sm">
        <Link href="/">Back to the homepage</Link>
      </Button>
    </div>
  );
}
