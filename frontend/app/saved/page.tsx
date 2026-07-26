"use client";

// The companies the logged-in user has saved (bookmarked). Un-hearting a card
// removes it from the grid immediately, because we filter by the live bookmark
// state, not just the list we fetched.

import * as React from "react";
import Link from "next/link";

import { apiGet } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useBookmarks } from "@/components/providers/bookmark-provider";
import { CompanyCard, type Company } from "@/components/company/company-card";
import { Button } from "@/components/ui/button";
import { CompanyGridSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { RedirectToLogin } from "@/components/auth/gates";

export default function SavedPage() {
  const { user, isLoading } = useAuth();
  const { isBookmarked } = useBookmarks();

  const [companies, setCompanies] = React.useState<Company[] | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const result = await apiGet("/me/bookmarks");
      if (!active) return;
      if (!result.ok) {
        setStatus("error");
        return;
      }
      setCompanies((result.data as { companies: Company[] }).companies);
      setStatus("ready");
    })();
    return () => {
      active = false;
    };
  }, [user, reloadKey]);

  if (isLoading) return <CompanyGridSkeleton count={3} />;
  if (!user) return <RedirectToLogin />;
  if (status === "loading") return <CompanyGridSkeleton count={3} />;
  if (status === "error") {
    return (
      <ErrorState
        description="We couldn't load your saved companies. Try again."
        onRetry={() => {
          setStatus("loading");
          setReloadKey((k) => k + 1);
        }}
      />
    );
  }

  // show only the ones still saved, so un-hearting removes them live
  const visible = (companies ?? []).filter((c) => isBookmarked(c.id));

  return (
    <div className="space-y-6 py-2">
      <header className="space-y-2">
        <h1 className="text-heading text-ink">Saved companies</h1>
        <p className="text-body text-ink-secondary">
          Your shortlist. Tap the heart on any company to save or remove it.
        </p>
      </header>

      {visible.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Tap the heart on a company to add it here, so it's easy to find and compare later."
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/companies">Browse companies</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}
