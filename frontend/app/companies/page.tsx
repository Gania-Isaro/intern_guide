"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

// The homepage search box sends people here as /companies?search=Kivu, so the
// box on this page starts out holding whatever they typed there.
export default function CompaniesPage() {
    return (
        <React.Suspense fallback={<CompanyGridSkeleton count={6} />}>
            <CompaniesBrowser />
        </React.Suspense>
    );
}

function CompaniesBrowser() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initialSearch = searchParams.get("search") ?? "";

    const [search, setSearch] = React.useState(initialSearch);
    const [industry, setIndustry] = React.useState("");
    const [compensation, setCompensation] = React.useState<string[]>([]);
    const [workMode, setWorkMode] = React.useState<string[]>([]);
    const [schedule, setSchedule] = React.useState<string[]>([]);
    const [amenity, setAmenity] = React.useState<string[]>([]);
    const [sort, setSort] = React.useState("rating");
    // the page number lives in the address bar (?page=2), so a refresh or a
    // shared link lands on the same page. It starts from whatever the URL says.
    const [page, setPage] = React.useState(() => Number(searchParams.get("page")) || 1);
    const [searchInput, setSearchInput] = React.useState(initialSearch);
    const [data, setData] = React.useState<CompanyListResponse | null>(null);
    const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
    const [reloadKey, setReloadKey] = React.useState(0);

    // Build a new URL for this page, keeping the other query bits (like ?search)
    // that are already there. Reads the live URL each time, so it is never stale.
    const hrefForPage = React.useCallback(
        (next: number) => {
            const params = new URLSearchParams(window.location.search);
            if (next > 1) params.set("page", String(next));
            else params.delete("page"); // page 1 is the clean default, no ?page=1
            const qs = params.toString();
            return qs ? `${pathname}?${qs}` : pathname;
        },
        [pathname]
    );

    // Next/Previous: a real history entry, so the browser Back button steps
    // back through the pages you visited.
    function goToPage(next: number) {
        router.push(hrefForPage(next));
    }

    // Filters and search send you back to page 1. That is not worth a history
    // entry, so it replaces the current one and just drops the ?page.
    const resetToFirstPage = React.useCallback(() => {
        setPage(1);
        router.replace(hrefForPage(1));
    }, [router, hrefForPage]);

    // When the URL's page changes - from goToPage above, or the Back/Forward
    // buttons - copy it into state so the list reloads to match.
    React.useEffect(() => {
        const urlPage = Number(searchParams.get("page")) || 1;
        setPage((current) => (current === urlPage ? current : urlPage));
    }, [searchParams]);

    // debounce the search box. Skip the very first run so a shared link like
    // /companies?search=Kivu&page=2 is not reset to page 1 on load.
    const firstSearchRun = React.useRef(true);
    React.useEffect(() => {
        if (firstSearchRun.current) {
            firstSearchRun.current = false;
            return;
        }
        const id = setTimeout(() => {
            setSearch(searchInput.trim());
            resetToFirstPage();
        }, 350);
        return () => clearTimeout(id);
    }, [searchInput, resetToFirstPage]);

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
        resetToFirstPage();
    }

       function resetFilters() {
        setSearch("");
        setSearchInput("");
        setIndustry("");
        setSort("rating");
        setCompensation([]);
        setWorkMode([]);
        setSchedule([]);
        setAmenity([]);
        resetToFirstPage();
    }

       const hasActiveFilters =
        search !== "" ||
        industry !== "" ||
        compensation.length > 0 ||
        workMode.length > 0 ||
        schedule.length > 0 ||
        amenity.length > 0;

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
            resetToFirstPage();
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
            resetToFirstPage();
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

      {/* --- what the internship is actually like --- */}
      <div className="space-y-4 rounded-card border border-border bg-white p-5 shadow-soft">
        <FilterGroup
          title="Pay"
          labels={COMPENSATION_LABELS}
          selected={compensation}
          onToggle={(value) => toggle(compensation, setCompensation, value)}
        />
        <FilterGroup
          title="Where"
          labels={WORK_MODE_LABELS}
          selected={workMode}
          onToggle={(value) => toggle(workMode, setWorkMode, value)}
        />
        <FilterGroup
          title="Hours"
          labels={SCHEDULE_LABELS}
          selected={schedule}
          onToggle={(value) => toggle(schedule, setSchedule, value)}
        />
        <FilterGroup
          title="What they offer"
          labels={AMENITY_LABELS}
          selected={amenity}
          onToggle={(value) => toggle(amenity, setAmenity, value)}
        />
        <p className="text-sm text-ink-muted">
          Pay, place and hours belong to a posting, so a company shows up when
          one of its open internships matches everything you ticked.
        </p>
      </div>
      {status === "ready" && data && (
        <p className= "text-sm text-ink-muted">
            {data.total} {data.total === 1 ? "company" : "companies"}{" "}
            {hasActiveFilters
                ? data.total === 1 ? "matches your filters" : "match your filters"
                : "listed"}
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
                onClick={() => goToPage(Math.max(1, page - 1))}
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
                onClick={() => goToPage(page + 1)}
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

// One row of tick-able chips. A chip is just a button that remembers whether
// it is on, which reads better on a phone than a row of checkboxes.
function FilterGroup({
  title,
  labels,
  selected,
  onToggle,
}: {
  title: string;
  labels: Record<string, string>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-label text-ink-secondary">{title}</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(labels).map(([value, label]) => {
          const isOn = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isOn}
              onClick={() => onToggle(value)}
              className={
                isOn
                  ? "rounded-chip border border-primary bg-primary-tint px-3 py-1.5 text-sm text-primary-deep"
                  : "rounded-chip border border-border bg-white px-3 py-1.5 text-sm text-ink-secondary hover:border-primary"
              }
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}