"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Globe, Briefcase, CalendarClock, Heart } from "lucide-react";

import { apiGet } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useBookmarks } from "@/components/providers/bookmark-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { type Company } from "@/components/company/company-card";
import { CompanyCharts } from "@/components/company/company-charts";
import {
  AMENITY_LABELS,
  SCHEDULE_LABELS,
  WORK_MODE_LABELS,
  labelFor,
  payLine,
} from "@/lib/labels";

interface Internship {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  deadline: string | null;
  is_active: boolean;
  compensation: string;
  stipend_amount: number | null;
  stipend_currency: string | null;
  stipend_period: string | null;
  work_mode: string;
  schedule: string;
  duration_months: number | null;
  start_date: string | null;
  openings: number;
  field: string | null;
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
  google_address: string | null;
  size: string | null;
  founded_year: number | null;
  amenities: string[];
}

// A small grey pill. Used for the perks and for the pay/place/hours tags on
// each internship, so they all look the same.
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-chip bg-paper px-2.5 py-1 text-sm text-ink-secondary">
      {children}
    </span>
  );
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

  const { user } = useAuth();
  const { isBookmarked, toggle } = useBookmarks();

  const [company, setCompany] = React.useState<CompanyDetail | null>(null);
  const [status, setStatus] = React.useState<
    "loading" | "ready" | "error" | "not-found"
  >("loading");
  const [reloadKey, setReloadKey] = React.useState(0);
  // where this student stands with THIS company, so the button matches:
  //   approved -> can write a review     pending  -> proof is being checked
  //   rejected -> can upload again        none     -> hasn't submitted proof
  const [myStatus, setMyStatus] = React.useState<
    "approved" | "pending" | "rejected" | "none"
  >("none");
  const canReview = myStatus === "approved";

  React.useEffect(() => {
    if (!user || user.role !== "student") {
      setMyStatus("none");
      return;
    }
    (async () => {
      const result = await apiGet("/me/proofs");
      if (result.ok) {
        const list = (result.data as {
          placements: { company_id: number; status: "approved" | "pending" | "rejected" }[];
        }).placements;
        const mine = list.find((p) => p.company_id === Number(id));
        setMyStatus(mine ? mine.status : "none");
      }
    })();
  }, [user, id]);

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
            <div className="flex items-center gap-2">
              <h1 className="text-heading text-ink">{company.name}</h1>
              {user?.role === "student" && (
                <button
                  type="button"
                  onClick={() => toggle({ id: company.id, name: company.name })}
                  aria-label={isBookmarked(company.id) ? "Remove from saved" : "Save company"}
                  aria-pressed={isBookmarked(company.id)}
                  className="rounded-full p-1.5 text-ink-muted hover:bg-paper"
                >
                  <Heart
                    className={`h-5 w-5 ${isBookmarked(company.id) ? "fill-danger text-danger" : ""}`}
                  />
                </button>
              )}
            </div>
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
          {user?.role === "student" && (
            <>
              {myStatus === "approved" && (
                <Button asChild variant="primary">
                  <Link href={`/reviews/new?company=${company.id}`}>Write a review</Link>
                </Button>
              )}
              {/* proof sent but not decided yet: say so, don't offer to re-upload */}
              {myStatus === "pending" && <Badge status="pending" />}
              {myStatus === "rejected" && (
                <Button asChild variant="secondary">
                  <Link href={`/verify?company=${company.id}`}>Upload proof again</Link>
                </Button>
              )}
              {myStatus === "none" && (
                <Button asChild variant="secondary">
                  <Link href={`/verify?company=${company.id}`}>Verify your placement here</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </header>
      {/* --- about --- */}
      {(company.description || company.size || company.founded_year) && (
        <section className="space-y-3">
          <h2 className="text-card-title text-ink">About</h2>
          {company.description && (
            <p className="max-w-3xl text-body text-ink-secondary">{company.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {company.size && <Tag>{company.size} people</Tag>}
            {company.founded_year && <Tag>Founded {company.founded_year}</Tag>}
          </div>
        </section>
      )}

      {/* --- what they offer interns --- */}
      {company.amenities.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-card-title text-ink">What they offer interns</h2>
          <div className="flex flex-wrap gap-2">
            {company.amenities.map((amenity) => (
              <Tag key={amenity}>{labelFor(AMENITY_LABELS, amenity)}</Tag>
            ))}
          </div>
        </section>
      )}

      {/* --- where they are --- */}
      {company.google_address && (
        <section className="space-y-3">
          <h2 className="text-card-title text-ink">Where they are</h2>
          <p className="text-body text-ink-secondary">{company.google_address}</p>
          {/* Google's own embed URL. It needs no API key, so there is no key to
              leak and nothing to pay for - the address is simply handed over as
              a search. encodeURIComponent keeps commas and spaces safe. */}
          <iframe
            title={`Map showing ${company.name}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              company.google_address
            )}&output=embed`}
            className="h-72 w-full rounded-card border border-border"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
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

                {/* the three things a student checks first: does it pay, where
                    is it, and how many hours */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Tag>{payLine(role)}</Tag>
                  <Tag>{labelFor(WORK_MODE_LABELS, role.work_mode)}</Tag>
                  <Tag>{labelFor(SCHEDULE_LABELS, role.schedule)}</Tag>
                  {role.duration_months && <Tag>{role.duration_months} months</Tag>}
                  {role.field && <Tag>{role.field}</Tag>}
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

      {/* --- the numbers behind the reviews --- */}
      <section className="space-y-4">
        <h2 className="text-card-title text-ink">What the reviews add up to</h2>
        <CompanyCharts companyId={company.id} />
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
              user?.role !== "student" ? undefined : myStatus === "approved" ? (
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/reviews/new?company=${company.id}`}>Write a review</Link>
                </Button>
              ) : myStatus === "pending" ? (
                <p className="text-sm text-ink-muted">Your proof is being checked.</p>
              ) : (
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/verify?company=${company.id}`}>
                    {myStatus === "rejected"
                      ? "Upload proof again"
                      : "Verify your placement to review"}
                  </Link>
                </Button>
              )
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper font-display text-sm font-semibold text-ink">
            {review.reviewer_name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-card-title text-ink">
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
        <StarRating value={review.rating} readOnly showValue className="shrink-0" />
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
