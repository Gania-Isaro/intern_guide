"use client"; // needs useState for the mobile menu toggle

import * as React from "react";
import Link from "next/link"; // Next.js's fast-navigation version of <a>
import { ShieldCheck, Menu, X } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

// The main navigation links, kept in one list so adding a new link
// later just means adding one line here
const NAV_LINKS = [
  { label: "Companies", href: "/companies" },
  { label: "How it works", href: "/how-it-works" },
  { label: "For employers", href: "/employers" },
];

function Navbar() {
  const [open, setOpen] = React.useState(false); // is the mobile menu open?

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="container flex h-[72px] items-center justify-between">
        {/* Logo: shield icon + "Intern" in dark text + "Guide" in green */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <ShieldCheck className="h-[22px] w-[22px] text-primary" />
          <span className="font-display text-[19px] font-semibold">
            <span className="text-ink">Intern</span>
            <span className="text-primary">Guide</span>
          </span>
        </Link>

        {/* Desktop links — hidden on mobile (md:flex) */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14.5px] font-semibold text-ink-secondary hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="primary">
            <Link href="/register">Create account</Link>
          </Button>
        </div>

        {/* Hamburger icon — mobile only */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-control md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)} // flips open/closed each tap
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu — only shows when open is true */}
      <nav className={cn("flex flex-col gap-1 border-t border-border px-6 pb-4 pt-2 md:hidden", open ? "block" : "hidden")}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-control px-2 py-2.5 text-[14.5px] font-semibold text-ink-secondary hover:bg-paper"
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/register"
          className="mt-2 rounded-control bg-primary px-2 py-2.5 text-center font-display text-[15px] font-medium text-white"
          onClick={() => setOpen(false)}
        >
          Create account
        </Link>
      </nav>
    </header>
  );
}

export { Navbar };