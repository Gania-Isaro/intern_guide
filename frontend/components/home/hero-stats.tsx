"use client"; // fetches the real counts from the API in the browser

import * as React from "react";

import { apiGet } from "@/lib/api";

interface Summary {
  companies: number;
  reviews: number;
  industries: number;
}

// key matches the field the API sends; label is what the visitor reads
const STATS: { key: keyof Summary; label: string }[] = [
  { key: "companies", label: "Companies listed" },
  { key: "reviews", label: "Verified reviews" },
  { key: "industries", label: "Industries covered" },
];

// The three numbers under the homepage search box. They used to be hard-coded
// ("128 companies") which stopped matching the database; now they come from
// GET /stats/summary so they always tell the truth.
export function HeroStats() {
  const [summary, setSummary] = React.useState<Summary | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const result = await apiGet("/stats/summary");
      if (active && result.ok) setSummary(result.data as Summary);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mt-9 flex gap-10">
      {STATS.map((stat) => (
        <div key={stat.key} className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {/* a dash while the count is still loading */}
            {summary ? summary[stat.key] : "-"}
          </div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
