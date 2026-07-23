"use client";


import * as React from "react";
import type { EChartsOption } from "echarts";

import { apiGet } from "@/lib/api";
import { Chart } from "@/components/ui/chart";
import { ErrorState, LoadingState } from "@/components/ui/states";

interface Stats {
  total_reviews: number;
  categories: {
    mentorship: number;
    tasks: number;
    learning: number;
    environment: number;
  };
  distribution: { stars: number; count: number }[];
  trend: { year: number; average: number; count: number }[];
  // null when too few people answered the optional question
  gender_by_year: { year: number; female: number; male: number; other: number }[] | null;
}

// the app's green, taken from globals.css so the charts match everything else
const GREEN = "#18815A";
const DEEP = "#106045";
const AMBER = "#976A17";
const GREY = "#536057";

export function CompanyCharts({ companyId }: { companyId: number }) {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await apiGet(`/companies/${companyId}/stats`);
    if (result.ok) setStats(result.data as Stats);
    else setError(result.error);
    setLoading(false);
  }, [companyId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const categoryOption = React.useMemo<EChartsOption | null>(() => {
    if (!stats) return null;
    const c = stats.categories;
    return {
      tooltip: {},
      radar: {
        indicator: [
          { name: "Mentorship", max: 5 },
          { name: "Tasks", max: 5 },
          { name: "Learning", max: 5 },
          { name: "Environment", max: 5 },
        ],
        axisName: { color: GREY },
      },
      series: [
        {
          type: "radar",
          data: [
            {
              value: [c.mentorship, c.tasks, c.learning, c.environment],
              name: "Average score",
              areaStyle: { color: "rgba(24, 129, 90, 0.25)" },
              lineStyle: { color: GREEN },
              itemStyle: { color: GREEN },
            },
          ],
        },
      ],
    };
  }, [stats]);

  const distributionOption = React.useMemo<EChartsOption | null>(() => {
    if (!stats) return null;
    return {
      tooltip: { trigger: "axis" },
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: {
        type: "category",
        data: stats.distribution.map((d) => `${d.stars}★`),
        axisLabel: { color: GREY },
      },
      yAxis: { type: "value", minInterval: 1, axisLabel: { color: GREY } },
      series: [
        {
          type: "bar",
          data: stats.distribution.map((d) => d.count),
          itemStyle: { color: GREEN, borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  }, [stats]);

  const trendOption = React.useMemo<EChartsOption | null>(() => {
    if (!stats) return null;
    return {
      tooltip: { trigger: "axis" },
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: {
        type: "category",
        data: stats.trend.map((t) => String(t.year)),
        axisLabel: { color: GREY },
      },
      yAxis: { type: "value", min: 1, max: 5, axisLabel: { color: GREY } },
      series: [
        {
          type: "line",
          smooth: true,
          data: stats.trend.map((t) => t.average),
          lineStyle: { color: DEEP, width: 3 },
          itemStyle: { color: DEEP },
          areaStyle: { color: "rgba(16, 96, 69, 0.12)" },
        },
      ],
    };
  }, [stats]);

  const genderOption = React.useMemo<EChartsOption | null>(() => {
    if (!stats?.gender_by_year) return null;
    const years = stats.gender_by_year;
    return {
      tooltip: { trigger: "axis" },
      // pinned to the top, otherwise it lands on top of the year labels
      legend: { top: 0, textStyle: { color: GREY } },
      grid: { left: 40, right: 16, top: 40, bottom: 30 },
      xAxis: {
        type: "category",
        data: years.map((y) => String(y.year)),
        axisLabel: { color: GREY },
      },
      yAxis: { type: "value", minInterval: 1, axisLabel: { color: GREY } },
      series: [
        {
          name: "Women",
          type: "bar",
          stack: "interns",
          data: years.map((y) => y.female),
          itemStyle: { color: GREEN },
        },
        {
          name: "Men",
          type: "bar",
          stack: "interns",
          data: years.map((y) => y.male),
          itemStyle: { color: AMBER },
        },
        {
          name: "Other",
          type: "bar",
          stack: "interns",
          data: years.map((y) => y.other),
          itemStyle: { color: GREY },
        },
      ],
    };
  }, [stats]);

  if (loading) return <LoadingState label="Loading the charts…" />;
  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!stats) return null;

  if (stats.total_reviews === 0) {
    return (
      <p className="text-ink-secondary">
        No approved reviews yet, so there is nothing to chart. Be the first to
        review this company.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-secondary">
        Based on {stats.total_reviews} approved{" "}
        {stats.total_reviews === 1 ? "review" : "reviews"} from verified interns.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="How interns scored each area">
          {categoryOption && (
            <Chart option={categoryOption} label="Average score for each category" />
          )}
        </ChartCard>

        <ChartCard title="Spread of overall ratings">
          {distributionOption && (
            <Chart option={distributionOption} label="Number of reviews per star rating" />
          )}
        </ChartCard>

        {stats.trend.length > 0 && (
          <ChartCard title="Average rating by internship year">
            {trendOption && (
              <Chart option={trendOption} label="Average rating for each year" />
            )}
          </ChartCard>
        )}

        <ChartCard title="Who interned here, by year">
          {genderOption ? (
            <Chart option={genderOption} label="Interns by gender for each year" />
          ) : (
            <p className="text-sm text-ink-secondary">
              Not enough interns have answered the optional question yet. We only
              show this once enough people have replied, so that no single
              reviewer can be recognised.
            </p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-white p-5 shadow-soft">
      <h3 className="mb-3 text-card-title">{title}</h3>
      {children}
    </div>
  );
}
