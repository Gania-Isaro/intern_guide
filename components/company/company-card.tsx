import Link from "next/link";
import { StarRating } from "@/components/ui/star-rating";

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

export function CompanyCard({ company }: { company: Company }) {
    const meta = [company.industry, company.location].filter(Boolean).join(" · ");

    return (
        <Link
            href={`/companies/${company.id}`}
            className="block rounded-card border border-border bg-white p-lg shadow-soft transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <div className="flex items-start gap-3">
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
    );
}
