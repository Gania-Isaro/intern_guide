"use client";

// My Reviews (D9): everything I've submitted, each with its status.
//
// pending  -> an admin hasn't looked at it yet
// approved -> live on the company's page (shown with the Verified badge)
// rejected -> the admin turned it down

import * as React from "react";
import Link from "next/link";

import { apiGet } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";

interface MyReview {
  id: number;
  company_id: number;
  company_name: string;
  rating: number;
  mentorship: number;
  tasks: number;
  learning: number;
  environment: number;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const STATUS_BADGE = {
  approved: "verified",
  pending: "pending",
  rejected: "rejected",
} as const;

const STATUS_NOTE = {
  approved: "Live on the company's page.",
  pending: "Waiting for an admin to check it.",
  rejected: "An admin turned this one down.",
} as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyReviewsPage() {
  const { user, isLoading } = useAuth();

  const [reviews, setReviews] = React.useState<MyReview[] | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const result = await apiGet("/me/reviews");
      if (!active) return;
      if (!result.ok) {
        setStatus("error");
        return;
      }
      setReviews((result.data as { reviews: MyReview[] }).reviews);
      setStatus("ready");
    })();
    return () => {
      active = false;
    };
  }, [user, reloadKey]);

  if (isLoading) return <LoadingState label="Checking your account…" />;

  if (!user) {
    return (
      <EmptyState
        title="Log in to see your reviews"
        description="Your submitted reviews and their status live here."
        action={
          <Button asChild variant="primary" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
        }
      />
    );
  }

  if (status === "loading") return <LoadingState label="Loading your reviews…" />;

  if (status === "error") {
    return (
      <ErrorState
        description="We couldn't load your reviews. Check your connection and try again."
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
        <h1 className="font-display text-heading text-ink">My reviews</h1>
        <p className="text-body text-ink-secondary">
          Each review shows its status — only approved ones appear publicly.
        </p>
      </header>

      {reviews && reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="Once you review a company where you interned, it shows up here with its status."
          action={
            <Button asChild variant="secondary" size="sm">
              <Link href="/companies">Browse companies</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {reviews?.map((review) => (
            <article
              key={review.id}
              className="rounded-card border border-border bg-white p-lg shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/companies/${review.company_id}`}
                    className="text-card-title text-ink hover:text-primary"
                  >
                    {review.company_name}
                  </Link>
                  <p className="text-sm text-ink-muted">
                    {formatDate(review.created_at)}
                  </p>
                </div>
                <Badge status={STATUS_BADGE[review.status]} />
              </div>

              <div className="mt-3">
                <StarRating value={review.rating} readOnly showValue />
              </div>

              {review.comment && (
                <p className="mt-3 text-body text-ink-secondary">{review.comment}</p>
              )}

              <p className="mt-3 text-sm text-ink-muted">
                {STATUS_NOTE[review.status]}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}