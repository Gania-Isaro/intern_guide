"use client";

// My placements: every company the student uploaded proof for, and where each
// one stands, so they can see at a glance which ones they may review.
//
//   approved -> proof accepted, they can write a review here
//   pending  -> an admin hasn't checked the proof yet
//   rejected -> the admin turned it down, they can try again

import * as React from "react";
import Link from "next/link";

import { apiGet } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { RedirectToLogin, NotAllowed } from "@/components/auth/gates";

interface Placement {
  company_id: number;
  company_name: string;
  status: "approved" | "pending" | "rejected";
  reviewed: boolean;
  last_submitted: string;
}

// the design-system badge only knows these three names
const STATUS_BADGE = {
  approved: "verified",
  pending: "pending",
  rejected: "rejected",
} as const;

const STATUS_NOTE = {
  approved: "Your proof was accepted. You can review this company.",
  pending: "Waiting for an admin to check your proof.",
  rejected: "An admin didn't accept this proof. You can upload a new one.",
} as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyPlacementsPage() {
  const { user, isLoading } = useAuth();

  const [placements, setPlacements] = React.useState<Placement[] | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!user || user.role !== "student") return;
    let active = true;
    (async () => {
      const result = await apiGet("/me/proofs");
      if (!active) return;
      if (!result.ok) {
        setStatus("error");
        return;
      }
      setPlacements((result.data as { placements: Placement[] }).placements);
      setStatus("ready");
    })();
    return () => {
      active = false;
    };
  }, [user, reloadKey]);

  if (isLoading) return <LoadingState label="Checking your account…" />;
  if (!user) return <RedirectToLogin />;

  // only students have placements; anyone else gets a plain explanation
  if (user.role !== "student") {
    return (
      <NotAllowed
        title="This page is for students"
        text="Placements track the internships a student uploaded proof for. Company and admin accounts don't have them."
      />
    );
  }

  if (status === "loading") return <LoadingState label="Loading your placements…" />;

  if (status === "error") {
    return (
      <ErrorState
        description="We couldn't load your placements. Check your connection and try again."
        onRetry={() => {
          setStatus("loading");
          setReloadKey((k) => k + 1);
        }}
      />
    );
  }

  return (
    <div className="space-y-8 py-2">
      <header className="space-y-2">
        <h1 className="font-display text-heading text-ink">My placements</h1>
        <p className="text-body text-ink-secondary">
          Each company you uploaded proof for, and whether you can review it yet.
        </p>
        {/* the only place to start a NEW placement (a company not listed here) */}
        <div className="pt-1">
          <Button asChild variant="secondary" size="sm">
            <Link href="/verify">Verify another placement</Link>
          </Button>
        </div>
      </header>

      {placements && placements.length === 0 ? (
        <EmptyState
          title="No placements yet"
          description="Upload proof that you interned somewhere, and once an admin approves it you can review that company."
          action={
            <Button asChild variant="primary" size="sm">
              <Link href="/verify">Verify a placement</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {placements?.map((placement) => (
            <article
              key={placement.company_id}
              className="rounded-card border border-border bg-white p-lg shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/companies/${placement.company_id}`}
                    className="text-card-title text-ink hover:text-primary"
                  >
                    {placement.company_name}
                  </Link>
                  <p className="text-sm text-ink-muted">
                    Submitted {formatDate(placement.last_submitted)}
                  </p>
                </div>
                <Badge status={STATUS_BADGE[placement.status]} />
              </div>

              <p className="mt-3 text-sm text-ink-muted">
                {STATUS_NOTE[placement.status]}
              </p>

              {/* the action depends on the status */}
              <div className="mt-4">
                {placement.status === "approved" &&
                  (placement.reviewed ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/my-reviews">Review submitted - view it</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="primary" size="sm">
                      <Link href={`/reviews/new?company=${placement.company_id}`}>
                        Write a review
                      </Link>
                    </Button>
                  ))}

                {placement.status === "rejected" && (
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/verify?company=${placement.company_id}`}>
                      Upload proof again
                    </Link>
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
