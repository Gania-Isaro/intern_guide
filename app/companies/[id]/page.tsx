"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Globe, Briefcase, CalendarClock } from "lucide-react";

import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { type Company } from "@/components/company/company-card";

interface Internship {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  deadline: string | null;
  is_active: boolean;
}

interface Review {
  id: number;
  rating: number;
  mentorship: number;
  tasks: number;
  learning: number;
  environment: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
  reviewer_verified: boolean;
  reply: { body: string; created_at: string } | null;
}

interface CompanyDetail extends Company {
  internships: Internship[];
  reviews: Review[];
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Next 16: params arrives as a Promise, unwrapped with React.use().
export default function CompanyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const [company, setCompany] = React.useState<CompanyDetail | null>(null);
  const [status, setStatus] = React.useState<
    "loading" | "ready" | "error" | "not-found"
  >("loading");
  const [reloadKey, setReloadKey] = React.useState(0);

  // fetch on id / reload change, in an async closure so nothing is set
  // synchronously in the effect body
  React.useEffect(() => {
    let active = true;
    (async () => {
      const result = await apiGet(`/companies/${id}`);
      if (!active) return;
      if (!result.ok) {
        // the API returns 404 with "company not found" for a missing id
        setStatus(result.error === "company not found" ? "not-found" : "error");
        return;
      }
      setCompany(result.data as CompanyDetail);
      setStatus("ready");
    })();
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  function retry() {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  }

  // while loading, or when the loaded company is for a previous id (the user
  // navigated to another company), show the loading state
  const isStale = company !== null && company.id !== Number(id);
  if (status === "loading" || isStale)
    return <LoadingState label="Loading company…" />;
  if (status === "error")
    return <ErrorState description="We couldn't load this company." onRetry={retry} />;
  if (status === "not-found")
    return (
      <EmptyState
        title="Company not found"
        description="This company doesn't exist or may have been removed."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/companies">Back to companies</Link>
          </Button>
        }
      />
    );
  if (!company) return null;

  const meta = [company.industry, company.location].filter(Boolean).join(" · ");
  const hasReviews = company.review_count > 0;

  return (
    <div className="space-y-10 py-2">
      {/* --- breadcrumb --- */}
      <Link href="/companies" className="text-sm text-ink-secondary hover:text-ink">
        ← All companies
      </Link>

      {/* --- header --- */}
      <header className="flex flex-col gap-6 rounded-card border border-border bg-white p-lg shadow-soft md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-paper font-display text-lg font-semibold text-ink">
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-2">
            <h1 className="text-heading text-ink">{company.name}</h1>
            {meta && <p className="text-body text-ink-secondary">{meta}</p>}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-ink-secondary">
              {company.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-ink-muted" />
                  {company.location}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:text-primary-deep"
                >
                  <Globe className="h-4 w-4" />
                  Visit website
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          {hasReviews ? (
            <div className="text-right">
              <StarRating value={company.average_rating ?? 0} readOnly size="lg" showValue />
              <p className="mt-1 text-sm text-ink-muted">
                {company.review_count} {company.review_count === 1 ? "review" : "reviews"}
                {company.verified_count > 0 && ` · ${company.verified_count} verified`}
              </p>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">No reviews yet</p>
          )}
          <Button asChild variant="primary">
            <Link href={`/reviews/new?company=${company.id}`}>Write a review</Link>
          </Button>
        </div>
      </header>
      {/* --- about --- */}
      {company.description && (
        <section className="space-y-3">
          <h2 className="text-card-title text-ink">About</h2>
          <p className="max-w-3xl text-body text-ink-secondary">{company.description}</p>
        </section>
      )}

      {/* --- open internships --- */}
      <section className="space-y-4">
        <h2 className="text-card-title text-ink">Open internships</h2>
        {company.internships.length === 0 ? (
          <p className="text-body text-ink-muted">
            No open internships posted right now.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {company.internships.map((role) => (
              <div
                key={role.id}
                className="rounded-card border border-border bg-white p-lg shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-chip bg-primary-tint">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-card-title text-ink">{role.title}</h3>
                    {role.location && (
                      <p className="text-sm text-ink-secondary">{role.location}</p>
                    )}
                  </div>
                </div>
                {role.description && (
                  <p className="mt-3 line-clamp-3 text-body text-ink-secondary">
                    {role.description}
                  </p>
                )}
                {role.deadline && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-muted">
                    <CalendarClock className="h-4 w-4" />
                    Apply by {formatDate(role.deadline)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
       {/* --- reviews --- */}
      <section className="space-y-4">
        <h2 className="text-card-title text-ink">
          Reviews {hasReviews && <span className="text-ink-muted">({company.review_count})</span>}
        </h2>

        {!hasReviews ? (
          <EmptyState
            title="No reviews yet"
            description="Be the first verified intern to review this company."
            action={
              <Button asChild variant="secondary" size="sm">
                <Link href={`/reviews/new?company=${company.id}`}>Write a review</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {company.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// --- one review, matching the schema: overall rating + 4 category scores ---
const CATEGORIES: { key: keyof Review; label: string }[] = [
  { key: "mentorship", label: "Mentorship" },
  { key: "tasks", label: "Tasks" },
  { key: "learning", label: "Learning" },
  { key: "environment", label: "Environment" },
];

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-card border border-border bg-white p-lg shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper font-display text-sm font-semibold text-ink">
            {review.reviewer_name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="flex items-center gap-2 text-card-title text-ink">
              {review.reviewer_name}
              {review.reviewer_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-tint px-2 py-0.5 text-badge text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </p>
            <p className="text-sm text-ink-muted">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <StarRating value={review.rating} readOnly showValue />
      </div>

      {review.comment && (
        <p className="mt-4 text-body text-ink-secondary">{review.comment}</p>
      )}

      {/* the four category scores */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="space-y-1">
            <p className="text-sm text-ink-muted">{cat.label}</p>
            <StarRating value={review[cat.key] as number} readOnly size="sm" />
          </div>
        ))}
      </div>

      {/* owner's reply, if any */}
      {review.reply && (
        <div className="mt-4 rounded-chip border-l-2 border-primary bg-paper p-4">
          <p className="text-label text-ink">Response from the company</p>
          <p className="mt-1 text-body text-ink-secondary">{review.reply.body}</p>
          <p className="mt-1 text-sm text-ink-muted">{formatDate(review.reply.created_at)}</p>
        </div>
      )}
    </article>
  );
}
