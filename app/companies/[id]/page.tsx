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
      
