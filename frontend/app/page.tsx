import Link from "next/link";
import { Upload, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/home/hero-search";
import { HeroStats } from "@/components/home/hero-stats";

const STEPS = [
  {
    icon: Upload,
    title: "Upload your proof",
    description:
      "Add your internship certificate or offer letter when you submit a review. It's never shown publicly.",
  },
  {
    icon: ShieldCheck,
    title: "We verify you",
    description:
      "An admin checks the proof, then the file is deleted. Only the green Verified badge remains.",
  },
  {
    icon: Star,
    title: "Your review counts",
    description:
      "Rate mentorship, tasks, learning and environment. Company averages update automatically.",
  },
];

const RECENT_COMPANIES = [
  {
    initials: "KS",
    name: "Kivu Software",
    meta: "Software · Kigali",
    rating: "4.6",
    reviews: "23 reviews",
    verified: "18 of 23 verified",
  },
  {
    initials: "ID",
    name: "Isoko Digital",
    meta: "E-commerce · Kigali",
    rating: "4.8",
    reviews: "31 reviews",
    verified: "26 of 31 verified",
  },
  {
    initials: "AS",
    name: "Akagera Systems",
    meta: "Data & AI · Kigali",
    rating: "4.2",
    reviews: "17 reviews",
    verified: "11 of 17 verified",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-14 pb-12 sm:space-y-20 sm:pb-16">
      <section className="flex flex-col items-center pt-6 text-center sm:pt-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-accent-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          Every review is backed by proof
        </span>

        <h1 className="mt-5 max-w-2xl text-4xl font-bold text-foreground">
          Know the internship before you sign.
        </h1>

        <p className="mt-4 max-w-xl text-muted-foreground">
          Real reviews from verified interns in Rwanda - mentorship, tasks
          and learning, rated by people who actually did the work.
        </p>

        <HeroSearch />

        <HeroStats />
      </section>

      <section className="rounded-lg bg-muted px-6 py-10 text-center sm:py-14">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent-600">
          How it works
        </span>
        <h2 className="mt-2 text-2xl font-bold text-foreground">
          Trust is built in three steps
        </h2>

        <div className="mx-auto mt-8 grid max-w-4xl gap-5 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="rounded-md border border-border bg-white p-5 text-left"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-50">
                <step.icon className="h-4.5 w-4.5 text-accent-600" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6">
        {/* title + link stack on a phone so the heading never wraps awkwardly */}
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Recently reviewed companies
          </h2>
          <Button asChild variant="link" size="sm">
            <Link href="/companies">Browse all companies</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {RECENT_COMPANIES.map((c) => (
            <div
              key={c.name}
              className="rounded-md border border-border bg-white p-4"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                {c.initials}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                {c.name}
              </h3>
              <p className="text-xs text-muted-foreground">{c.meta}</p>
              <p className="mt-2 text-sm text-foreground">
                <span className="font-medium">★ {c.rating}</span>{" "}
                <span className="text-muted-foreground">{c.reviews}</span>
              </p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-700">
                <ShieldCheck className="h-3 w-3" />
                Verified · {c.verified}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-lg bg-accent-50 px-6 py-10 text-center sm:py-14">
  <h2 className="text-2xl font-bold text-foreground">
    Just finished your internship?
  </h2>
  <p className="mt-2 text-sm text-muted-foreground">
    Help the next intern choose well a verified review takes five minutes.
  </p>
  <Button asChild variant="primary" className="mt-6">
    <Link href="/reviews/new">Write a verified review</Link>
  </Button>
</section>
    </div>
  );
}