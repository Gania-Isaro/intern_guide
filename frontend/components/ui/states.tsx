import * as React from "react";
import { Loader2, SearchX, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shared empty / loading / error states for the discovery pages (C6).
// These prop shapes are exactly what app/companies/page.tsx and
// app/companies/[id]/page.tsx already pass — don't rename props without
// updating both pages.

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      <p className="text-body text-ink-secondary">{label}</p>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-white px-6 py-16 text-center shadow-soft">
      <AlertTriangle className="h-6 w-6 text-ink-muted" />
      <h3 className="text-card-title text-ink">{title}</h3>
      <p className="max-w-sm text-body text-ink-secondary">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-white px-6 py-16 text-center shadow-soft">
      <SearchX className="h-6 w-6 text-ink-muted" />
      <h3 className="text-card-title text-ink">{title}</h3>
      <p className="max-w-sm text-body text-ink-secondary">{description}</p>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

// Placeholder grid shown while the companies list loads. The card layout
// mirrors CompanyCard so nothing jumps when real data arrives.
export function CompanyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-card border border-border bg-white p-lg shadow-soft"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-chip bg-paper" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-2/3 rounded bg-paper" />
              <div className="h-3 w-1/2 rounded bg-paper" />
            </div>
          </div>
          <div className="mt-5 h-4 w-1/3 rounded bg-paper" />
        </div>
      ))}
    </div>
  );
}