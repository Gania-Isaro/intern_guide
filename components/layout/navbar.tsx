"use client"; // needs useState for the mobile menu toggle, so it runs in the browser

import * as React from "react";
import Link from "next/link"; // Next.js's version of <a>, for fast page navigation
import { Menu, X } from "lucide-react"; // hamburger icon and close (X) icon

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

// The links shown in the navbar. Kept in one array so adding a new
// link later just means adding one line here.
const NAV_LINKS = [
  { label: "Search Companies", href: "/companies" },
  { label: "Write a Review", href: "/reviews/new" },
  { label: "About", href: "/about" },
];

function Navbar() {
  // Tracks whether the mobile menu is currently open or closed
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo/site name — clicking it also closes the mobile menu if open */}
        <Link href="/" className="font-display text-xl font-bold text-foreground" onClick={() => setOpen(false)}>
          InternGuide
        </Link>

        {/* Links shown in a row — only visible on medium screens and up (md:flex) */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Login button — desktop only for now */}
        <div className="hidden md:block">
          <Button asChild size="sm">
            <Link href="/login">Log in</Link>
          </Button>
        </div>

        {/* Hamburger button — only visible on small screens (md:hidden) */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)} // flips true/false each click
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu — only rendered visible when "open" is true */}
      <nav
        className={cn(
          "flex flex-col gap-1 border-t border-border px-6 pb-4 pt-2 md:hidden",
          open ? "block" : "hidden"
        )}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => setOpen(false)} // tapping a link also closes the menu
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/login"
          className="mt-2 rounded-md bg-primary px-2 py-2.5 text-center text-sm font-medium text-primary-foreground"
          onClick={() => setOpen(false)}
        >
          Log in
        </Link>
      </nav>
    </header>
  );
}

export { Navbar };