"use client"; // needs to read what you type and then move you to another page

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

/** The search box on the homepage.
 *
 * It does not search here - it sends you to /companies with your words in the
 * address, and that page does the searching. So the result is a normal, shared
 * link: /companies?search=Kivu
 */
export function HeroSearch() {
  const router = useRouter();
  const [term, setTerm] = React.useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const query = term.trim();
    router.push(query ? `/companies?search=${encodeURIComponent(query)}` : "/companies");
  }

  return (
    // items-stretch keeps the box and the button the same height (h-12),
    // and the icon is centred inside that same height
    <form onSubmit={handleSubmit} className="mt-7 flex w-full max-w-lg items-stretch gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          aria-label="Search a company"
          placeholder="Search a company, e.g. Kivu Software"
          className="h-12 w-full rounded-md border border-border pl-10 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring focus:outline-none"
        />
      </div>
      <Button variant="primary" size="lg" type="submit">
        Search
      </Button>
    </form>
  );
}
