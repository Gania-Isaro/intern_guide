"use client";

// Write a review (D4) with verification gating (D6).
//
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