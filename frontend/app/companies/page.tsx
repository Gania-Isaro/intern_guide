"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { apiGet } from "@/lib/api";
import { AMENITY_LABELS, COMPENSATION_LABELS, SCHEDULE_LABELS, WORK_MODE_LABELS, } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { CompanyCard, type Company } from "@/components/company/company-card";
import {
  CompanyGridSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/ui/states";

interface CompanyListResponse {
    companies: Company[];   
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    sort: string;
}

const SORT_CHOICES = [
    { value: "rating",label: "Highest rated" },
    { value: "reviews",label: "Most reviewed" },
    { value: "name",label: "Name (A–Z)" },
    { value: "newest",label: "Newest" },
];

const INDUSTRIES = ["Software", "Data & AI", "E-commerce", "Fintech", "Telecom"];

export default function CompaniesPage() {
    const [search, setSearch] = React.useState("");
    const [industry, setIndustry] = React.useState("");
    const [compensation, setCompensation] = React.useState<string[]>([]);
    const [workMode, setWorkMode] = React.useState<string[]>([]);
    const [schedule, setSchedule] = React.useState<string[]>([]);
    const [amenity, setAmenity] = React.useState<string[]>([]);
    const [sort, setSort] = React.useState("rating");
    const [page, setPage] = React.useState(1);
    const [searchInput, setSearchInput] = React.useState("");
    const [data, setData] = React.useState<CompanyListResponse | null>(null);
    const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
    const [reloadKey, setReloadKey] = React.useState(0);
    
    React.useEffect(() => {
        const id = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 350);
        return () => clearTimeout(id);
    }, [searchInput]);

    React.useEffect(() => {
        let active = true;
        (async () => {
            const result = await apiGet("/companies", {
                search,
                industry,
                sort,
                page,
                per_page: 12,
                compensation: compensation.join(","),
                work_mode: workMode.join(","),
                schedule: schedule.join(","),
                amenity: amenity.join(","),
            });
            if (!active) return;
            if (!result.ok) {
                setStatus("error");
                return;
            }
            setData(result.data as CompanyListResponse);
            setStatus("ready");
        })();
        return () => {
            active = false;
        };
        }, [search, industry, sort, page, reloadKey, compensation, workMode, schedule, amenity]);

    function retry() {
  setStatus("loading");
  setReloadKey((k) => k + 1);
}

    // Tick a box on, tick it off again. Every filter group works the same way,
    // so they all share this one function.
    function toggle(
        current: string[],
        set: (next: string[]) => void,
        value: string
    ) {
        set(
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value]
        );
        setPage(1);
    }
    
    function resetFilters() {
        setSearch("");
        setSearchInput("");
        setIndustry("");
        setSort("rating");
        setPage(1);
    }

    const hasActiveFilters = search !== "" || industry !== "";

    return (
    <div className="space-y-8 py-2">
      <header className="space-y-2">
        <h1 className="text-heading text-ink">Browse companies</h1>
        <p className="text-body text-ink-secondary">
          Real internship experiences, rated by interns who were verified with
          proof.
        </p>
      </header>

      {/* --- controls: search + industry + sort --- */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search a company, e.g. Kivu Software"
            aria-label="Search companies"
            className="w-full rounded-control border border-border bg-paper py-3 pl-10 pr-3.5 text-body text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <select
          value={industry}
          onChange={(e) => {
            setIndustry(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by industry"
          className="rounded-control border border-border bg-white px-3.5 py-3 text-body text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">All industries</option>
          {INDUSTRIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          aria-label="Sort companies"
          className="rounded-control border border-border bg-white px-3.5 py-3 text-body text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            {SORT_CHOICES.map((choice) => (
                <option key={choice.value} value={choice.value}>
                    {choice.label}
                </option>
            ))}
        </select>
      </div>    

      {status === "ready" && data && (
        <p className= "text-sm text-ink-muted">
            {data.total} {data.total === 1 ? "company" : "companies"}
            {hasActiveFilters ? "match your filters" : "listed"}
        </p>
        )}

     {status === "loading" && <CompanyGridSkeleton count={6} />}

      {status === "error" && (
        <ErrorState
          description="We couldn't load the companies. Check your connection and try again."
          onRetry={retry}
        />
      )}

      {status === "ready" && data && data.companies.length === 0 && (
        <EmptyState
          title="No companies found"
          description={
            hasActiveFilters
              ? "No companies match your search and filters. Try broadening them."
              : "There are no companies listed yet. Check back soon."
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}

      {status === "ready" && data && data.companies.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {/* --- pagination (C7) --- */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-ink-secondary">
                Page {data.page} of {data.total_pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
