"use client"; // needs useState for the mobile menu toggle

import * as React from "react";
import Link from "next/link"; // Next.js's fast-navigation version of <a>
import { ShieldCheck, Menu, X } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

// The main navigation links, kept in one list so adding a new link
// later just means adding one line here
const NAV_LINKS = [
  { label: "Companies", href: "/companies" },
  { label: "How it works", href: "/how-it-works" },
  { label: "For employers", href: "/employers" },
];

// Extra links that depend on who is logged in (from the
// session-awareness work) — admin, company owner, or student
function getRoleLinks(role?: string, isVerified?: boolean) {
  if (!role) return [];
  if (role === "admin") return [{ label: "Admin", href: "/admin" }];
  if (role === "company_owner") return [{ label: "My Company", href: "/company" }];
  return isVerified
    ? [{ label: "My Reviews", href: "/dashboard" }]
    : [{ label: "Dashboard", href: "/dashboard" }];
}

function Navbar() {
  const [open, setOpen] = React.useState(false); // is the mobile menu open?
  const { user, isLoading, logout } = useAuth(); // who is signed in right now
  const roleLinks = getRoleLinks(user?.role, user?.is_verified);

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

        {/* Desktop auth area — changes depending on login state */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? (
            <span className="text-[14.5px] text-ink-muted">Loading…</span>
          ) : user ? (
            <>
              {roleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[14.5px] font-semibold text-ink-secondary hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
              <Button variant="secondary" size="sm" onClick={() => logout()}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild variant="primary">
                <Link href="/register">Create account</Link>
              </Button>
            </>
          )}
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
        {user ? (
          <>
            {roleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-control px-2 py-2.5 text-[14.5px] font-semibold text-ink-secondary hover:bg-paper"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              className="mt-2 rounded-control border border-border px-2 py-2.5 text-center font-display text-[15px] font-medium text-ink"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            href="/register"
            className="mt-2 rounded-control bg-primary px-2 py-2.5 text-center font-display text-[15px] font-medium text-white"
            onClick={() => setOpen(false)}
          >
            Create account
          </Link>
        )}
      </nav>
    </header>
  );
}

export { Navbar };