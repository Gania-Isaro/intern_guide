"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { StarRating } from "@/components/ui/star-rating";
import { useAuth } from "@/components/providers/auth-provider";
import { useBookmarks } from "@/components/providers/bookmark-provider";
import { cn } from "@/lib/utils";

export interface Company {
    id: number;
    name: string;
    industry: string | null;
    location: string | null;
    average_rating: number | null;
    review_count: number;
    verified_count: number;
    website?: string | null;
    description?: string | null;
}

interface CompanyCardProps {
    company: Company;
    // compare mode: shows a "Compare" checkbox below the card
    selectable?: boolean;
    selected?: boolean;
    onToggleSelect?: () => void;
    selectDisabled?: boolean; // at the 3-company limit and this one isn't picked
}

export function CompanyCard({
    company,
    selectable = false,
    selected = false,
    onToggleSelect,
    selectDisabled = false,
}: CompanyCardProps) {
    const meta = [company.industry, company.location].filter(Boolean).join(" · ");
    const { user } = useAuth();
    const { isBookmarked, toggle } = useBookmarks();
    const saved = isBookmarked(company.id);

    // The border/hover live on the wrapper, so the heart and compare controls
    // can sit outside the <Link> and not trigger navigation.
    return (
        <div className="relative rounded-card border border-border bg-white shadow-soft transition-colors hover:border-primary">
            <Link
                href={`/companies/${company.id}`}
                className="block rounded-card p-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                <div className="flex items-start gap-3 pr-8">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-paper font-display text-sm font-semibold text-ink">
                        {company.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-1">
                        <h3 className="truncate text-card-title text-ink">{company.name}</h3>
                        {meta && <p className="truncate text-sm text-ink-secondary">{meta}</p>}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    {company.average_rating != null ? (
                        <StarRating value={company.average_rating} readOnly showValue />
                    ) : (
                        <span className="text-sm text-ink-muted">Not yet rated</span>
                    )}
                    <span className="text-sm text-ink-muted">
                        {company.review_count} {company.review_count === 1 ? "review" : "reviews"}
                    </span>
                </div>
            </Link>

            {/* save/bookmark heart - only students have a Saved page */}
            {user?.role === "student" && (
                <button
                    type="button"
                    onClick={() => toggle({ id: company.id, name: company.name })}
                    aria-label={saved ? "Remove from saved" : "Save company"}
                    aria-pressed={saved}
                    className="absolute right-3 top-3 rounded-full p-1.5 text-ink-muted hover:bg-paper"
                >
                    <Heart className={cn("h-5 w-5", saved && "fill-danger text-danger")} />
                </button>
            )}

            {/* compare checkbox - only shown in compare mode (the companies list) */}
            {selectable && (
                <label
                    className={cn(
                        "flex cursor-pointer items-center gap-2 border-t border-border px-lg py-2.5 text-sm text-ink-secondary",
                        selectDisabled && "cursor-not-allowed opacity-50"
                    )}
                >
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={onToggleSelect}
                        disabled={selectDisabled}
                        className="h-4 w-4 accent-primary"
                    />
                    Compare
                </label>
            )}
        </div>
    );
}
