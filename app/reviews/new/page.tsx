"use client";

// The page reads ?company=ID from the URL (the profile page links here),
// checks WHO you are before showing anything, and only lets a verified
// student fill in the four star categories and send.

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { apiGet, apiPost } from "@/lib/api";
import { validateReviewForm, type ReviewScores } from "@/lib/validation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState, LoadingState } from "@/components/ui/states";

// what each category means, in the student's words
const CATEGORIES: { key: keyof ReviewScores; label: string; hint: string }[] = [
  { key: "mentorship", label: "Mentorship", hint: "Did someone guide you and answer your questions?" },
  { key: "tasks", label: "Tasks", hint: "Was the work meaningful, or just fetching coffee?" },
  { key: "learning", label: "Learning", hint: "How much did you grow during the placement?" },
  { key: "environment", label: "Environment", hint: "Was the workplace welcoming and respectful?" },
];

// a friendly card used by every "you can't review yet" situation
function GateCard({
  title,
  text,
  buttonText,
  buttonHref,
}: {
  title: string;
  text: string;
  buttonText?: string;
  buttonHref?: string;
}) {
  return (
    <div className="mx-auto max-w-lg py-10">
      <div className="flex flex-col items-start gap-3 rounded-card border border-border bg-white p-lg shadow-soft">
        <h1 className="font-display text-card-title text-ink">{title}</h1>
        <p className="text-body text-ink-secondary">{text}</p>
        {buttonText && buttonHref && (
          <Button asChild variant="primary" size="sm">
            <Link href={buttonHref}>{buttonText}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function NewReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = Number(searchParams.get("company"));

  const { user, isLoading } = useAuth();

  const [companyName, setCompanyName] = React.useState<string | null>(null);
  const [scores, setScores] = React.useState<ReviewScores>({
    mentorship: 0,
    tasks: 0,
    learning: 0,
    environment: 0,
  });
  const [comment, setComment] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // look up the company's name so the page can say who you're reviewing
  React.useEffect(() => {
    if (!companyId) return;
    (async () => {
      const result = await apiGet(`/companies/${companyId}`);
      if (result.ok) {
        setCompanyName((result.data as { name: string }).name);
      }
    })();
  }, [companyId]);

  // ---------- gating (D6): check who you are before showing the form ----------
  if (isLoading) return <LoadingState label="Checking your account…" />;

  if (!user) {
    return (
      <GateCard
        title="Log in to write a review"
        text="Reviews are tied to real student accounts, so you need to be logged in first."
        buttonText="Log in"
        buttonHref="/login"
      />
    );
  }

  if (user.role !== "student") {
    return (
      <GateCard
        title="Only students can write reviews"
        text="Reviews come from interns who did a placement. Company and admin accounts can read them, but not write them."
      />
    );
  }

  if (!user.is_verified) {
    return (
      <GateCard
        title="Verify your placement first"
        text="Before your review can be trusted, we check that you really interned there. Upload your certificate or offer letter, and once an admin approves it you can review."
        buttonText="Upload proof of placement"
        buttonHref="/verify"
      />
    );
  }

  if (!companyId) {
    return (
      <EmptyState
        title="No company selected"
        description="Open a company's page and press its Write a review button."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/companies">Browse companies</Link>
          </Button>
        }
      />
    );
  }

  // ---------- the actual form (D4) ----------

  // live preview of the overall score once all four stars are chosen
  const allChosen = Object.values(scores).every((v) => v >= 1);
  const overall = allChosen
    ? (scores.mentorship + scores.tasks + scores.learning + scores.environment) / 4
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateReviewForm(scores);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await apiPost("/reviews", {
      company_id: companyId,
      ...scores,
      comment: comment.trim(),
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    // done — show them their submission with its pending status
    router.push("/my-reviews");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="font-display text-heading text-ink">Write a review</h1>
        <p className="text-body text-ink-secondary">
          {companyName ? (
            <>
              Reviewing <span className="text-ink">{companyName}</span>. Your
              review is published after an admin checks it.
            </>
          ) : (
            "Your review is published after an admin checks it."
          )}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* one star row per category */}
        <div className="space-y-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className="flex flex-col gap-2 rounded-card border border-border bg-white p-lg shadow-soft sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-card-title text-ink">{cat.label}</p>
                <p className="text-sm text-ink-muted">{cat.hint}</p>
                {errors[cat.key] && (
                  <p className="mt-1 text-sm text-danger">{errors[cat.key]}</p>
                )}
              </div>
              <StarRating
                value={scores[cat.key]}
                size="lg"
                onChange={(value) => {
                  setScores((prev) => ({ ...prev, [cat.key]: value }));
                  setErrors((prev) => ({ ...prev, [cat.key]: "" }));
                }}
              />
            </div>
          ))}
        </div>

        {/* the overall score, computed live from the four categories */}
        <div className="flex items-center justify-between rounded-card border border-border bg-paper p-lg">
          <p className="text-body text-ink-secondary">Overall rating</p>
          {overall !== null ? (
            <StarRating value={overall} readOnly showValue />
          ) : (
            <p className="text-sm text-ink-muted">Rate all four categories</p>
          )}
        </div>

        {/* optional comment */}
        <div className="space-y-2">
          <label htmlFor="comment" className="text-label text-ink">
            Tell other students more (optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="What should the next intern know before joining?"
            className="w-full rounded-control border border-border bg-white p-3.5 text-body text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {submitError && <p className="text-sm text-danger">{submitError}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Submit review
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/companies/${companyId}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

// useSearchParams needs a Suspense boundary in the App Router
export default function NewReviewPage() {
  return (
    <React.Suspense fallback={<LoadingState label="Loading…" />}>
      <NewReviewForm />
    </React.Suspense>
  );
}
