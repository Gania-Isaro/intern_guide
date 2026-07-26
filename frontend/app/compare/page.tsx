"use client";

// Side-by-side comparison of up to 3 companies (?ids=1,2,3). Companies are the
// columns, attributes the rows; the best value in each numeric row is highlighted.

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { apiGet } from "@/lib/api";
import { COMPENSATION_LABELS, AMENITY_LABELS, labelFor } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

interface CompareCompany {
  id: number;
  name: string;
  industry: string | null;
  location: string | null;
  size: string | null;
  average_rating: number | null;
  review_count: number;
  mentorship: number | null;
  tasks: number | null;
  learning: number | null;
  environment: number | null;
  amenities: string[];
  compensation: string[];
}

// numeric rows where a higher value "wins" (highlighted)
const SCORE_ROWS: { key: keyof CompareCompany; label: string }[] = [
  { key: "average_rating", label: "Overall rating" },
  { key: "mentorship", label: "Mentorship" },
  { key: "tasks", label: "Tasks" },
  { key: "learning", label: "Learning" },
  { key: "environment", label: "Environment" },
  { key: "review_count", label: "Reviews" },
];

function CompareTable() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids") ?? "";
  const [companies, setCompanies] = React.useState<CompareCompany[] | null>(null);

  React.useEffect(() => {
    if (!ids) {
      setCompanies([]);
      return;
    }
    (async () => {
      const result = await apiGet("/companies/compare", { ids });
      setCompanies(
        result.ok ? (result.data as { companies: CompareCompany[] }).companies : []
      );
    })();
  }, [ids]);

  if (companies === null) return <LoadingState label="Loading comparison…" />;

  if (companies.length < 2) {
    return (
      <EmptyState
        title="Pick companies to compare"
        description="Go to the companies list, tick 2 or 3 companies, then press Compare."
        action={
          <Button asChild variant="primary" size="sm">
            <Link href="/companies">Browse companies</Link>
          </Button>
        }
      />
    );
  }

  // best value per score row, so we can highlight the winner(s)
  const bestByRow: Record<string, number> = {};
  for (const row of SCORE_ROWS) {
    const values = companies
      .map((c) => c[row.key])
      .filter((v): v is number => typeof v === "number");
    if (values.length) bestByRow[row.key as string] = Math.max(...values);
  }

  const cell = "border-b border-border p-3 text-sm align-top";
  const head = "border-b border-border p-3 text-left text-sm font-medium text-ink-secondary";

  return (
    <div className="space-y-6 py-2">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-heading text-ink">Compare companies</h1>
        <Button asChild variant="secondary" size="sm">
          <Link href="/companies">Back to browse</Link>
        </Button>
      </header>

      {/* 2 companies fit any phone; only 3 needs a sideways scroll */}
      <div className="overflow-x-auto rounded-card border border-border bg-white shadow-soft">
        <table
          className={cn(
            "w-full border-collapse",
            companies.length >= 3 && "min-w-[560px]"
          )}
        >
          <thead>
            <tr>
              <th className={cn(head, "w-24")}></th>
              {companies.map((c) => (
                <th key={c.id} className={cn(head, "text-ink")}>
                  <Link href={`/companies/${c.id}`} className="hover:text-primary">
                    {c.name}
                  </Link>
                  <p className="text-xs font-normal text-ink-muted">
                    {[c.industry, c.location].filter(Boolean).join(" · ")}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCORE_ROWS.map((row) => (
              <tr key={row.key as string}>
                <td className={cn(cell, "font-medium text-ink-secondary")}>{row.label}</td>
                {companies.map((c) => {
                  const v = c[row.key];
                  const isBest =
                    typeof v === "number" && v === bestByRow[row.key as string] && companies.length > 1;
                  return (
                    <td
                      key={c.id}
                      className={cn(cell, isBest && "bg-primary-tint font-semibold text-primary-deep")}
                    >
                      {typeof v === "number" ? v : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className={cn(cell, "font-medium text-ink-secondary")}>Pay</td>
              {companies.map((c) => (
                <td key={c.id} className={cell}>
                  {c.compensation.length
                    ? c.compensation.map((p) => labelFor(COMPENSATION_LABELS, p)).join(", ")
                    : "—"}
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(cell, "font-medium text-ink-secondary")}>Company size</td>
              {companies.map((c) => (
                <td key={c.id} className={cell}>{c.size ? `${c.size} people` : "—"}</td>
              ))}
            </tr>
            <tr>
              <td className={cn(cell, "font-medium text-ink-secondary")}>What they offer</td>
              {companies.map((c) => (
                <td key={c.id} className={cell}>
                  {c.amenities.length
                    ? c.amenities.map((a) => labelFor(AMENITY_LABELS, a)).join(", ")
                    : "—"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <React.Suspense fallback={<LoadingState />}>
      <CompareTable />
    </React.Suspense>
  );
}
