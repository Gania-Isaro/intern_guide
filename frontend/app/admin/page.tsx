"use client";

// Admin dashboard with the moderation queue (E3).
//
// Two lists, straight from the admin API: reviews waiting for a decision
// and proofs of placement waiting for a decision. Every card has an
// Approve and a Reject button; a decided item leaves the list right away.

import * as React from "react";
import Link from "next/link";

import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";

interface PendingReview {
  id: number;
  rating: number;
  mentorship: number;
  tasks: number;
  learning: number;
  environment: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
  company_id: number;
  company_name: string;
}

interface PendingProof {
  id: number;
  file_name: string;
  created_at: string;
  student_name: string;
  student_email: string;
  company_name: string;
}
// a friendly card for every "you can't be here" situation
function GateCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center space-y-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-ink-secondary">{text}</p>
      <Button asChild variant="secondary" size="sm">
        <Link href="/">Back to the homepage</Link>
      </Button>
    </div>
  );
}
export default function AdminPage() {
  const { user, isLoading } = useAuth();

  const [reviews, setReviews] = React.useState<PendingReview[]>([]);
  const [proofs, setProofs] = React.useState<PendingProof[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  // remembers which item is mid-request, so its buttons can be disabled
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const loadQueues = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const [reviewsResult, proofsResult] = await Promise.all([
      apiGet("/admin/reviews"),
      apiGet("/admin/proofs"),
    ]);
    if (!reviewsResult.ok) {
      setError(reviewsResult.error);
    } else if (!proofsResult.ok) {
      setError(proofsResult.error);
    } else {
      setReviews((reviewsResult.data as { reviews: PendingReview[] }).reviews);
      setProofs((proofsResult.data as { proofs: PendingProof[] }).proofs);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    if (user?.role === "admin") loadQueues();
  }, [user, loadQueues]);

  // ---------- gating: admins only ----------
  if (isLoading) return <LoadingState label="Checking your account…" />;
  if (!user) {
    return (
      <GateCard
        title="Please log in"
        text="The moderation queue is only visible to logged-in admins."
      />
    );
  }
  if (user.role !== "admin") {
    return (
      <GateCard
        title="Admins only"
        text="This page is where admins review submissions. Your account doesn't have access."
      />
    );
  }
  // ---------- deciding ----------
  async function decide(kind: "reviews" | "proofs", id: number, decision: "approve" | "reject") {
    setBusyId(`${kind}-${id}`);
    const result = await apiPost(`/admin/${kind}/${id}/${decision}`, {});
    if (result.ok) {
      // the item is decided - remove it from its queue
      if (kind === "reviews") setReviews((list) => list.filter((r) => r.id !== id));
      else setProofs((list) => list.filter((p) => p.id !== id));
    } else {
      setError(result.error);
    }
    setBusyId(null);
  }

  if (loading) return <LoadingState label="Loading the moderation queue…" />;
  if (error) {
    return <ErrorState description={error} onRetry={loadQueues} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-10 px-4">
      <div>
        <h1 className="text-2xl font-bold">Moderation queue</h1>
        <p className="text-ink-secondary">
          Approve what belongs on the site, reject what doesn&apos;t.
        </p>
      </div>

      {/* ---------- pending proofs (people first: they unlock reviewing) ---------- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          Proofs of placement ({proofs.length})
        </h2>
        {proofs.length === 0 ? (
          <EmptyState
            title="No proofs waiting"
            description="When a student uploads a certificate, it shows up here."
          />
        ) : (
          proofs.map((proof) => (
            <div
              key={proof.id}
              className="rounded-card border border-border bg-white p-4 shadow-soft space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{proof.student_name}</p>
                <Badge status="pending" />
              </div>
              <p className="text-sm text-ink-secondary">
                {proof.student_email} · claims a placement at{" "}
                <span className="font-medium">{proof.company_name}</span>
              </p>
              <p className="text-sm text-ink-secondary">File: {proof.file_name}</p>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  disabled={busyId === `proofs-${proof.id}`}
                  onClick={() => decide("proofs", proof.id, "approve")}
                >
                  Approve &amp; verify student
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busyId === `proofs-${proof.id}`}
                  onClick={() => decide("proofs", proof.id, "reject")}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* ---------- pending reviews ---------- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <EmptyState
            title="No reviews waiting"
            description="New student reviews land here before going public."
          />
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-card border border-border bg-white p-4 shadow-soft space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{review.company_name}</p>
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} readOnly showValue size="sm" />
                  <Badge status="pending" />
                </div>
              </div>
              <p className="text-sm text-ink-secondary">
                by {review.reviewer_name} · mentorship {review.mentorship} · tasks{" "}
                {review.tasks} · learning {review.learning} · environment{" "}
                {review.environment}
              </p>
              {review.comment && <p className="text-sm">“{review.comment}”</p>}
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  disabled={busyId === `reviews-${review.id}`}
                  onClick={() => decide("reviews", review.id, "approve")}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busyId === `reviews-${review.id}`}
                  onClick={() => decide("reviews", review.id, "reject")}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}