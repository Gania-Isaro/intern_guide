"use client"; // needs useState for the mobile menu

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X } from "lucide-react";

import { useAuth, type AuthUser } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui";
import { InstallButton } from "@/components/pwa/install-button";
import { cn } from "@/lib/utils";

// The links shown when nobody is logged in.
const PUBLIC_LINKS = [
  { label: "Companies", href: "/companies" },
  { label: "How it works", href: "/how-it-works" },
  { label: "For employers", href: "/employers" },
];

/** The links a logged-in person sees.
 *
 * These REPLACE the public links: the bar shows one set at a time (public
 * when logged out, this set once logged in) so it never gets crowded. Every
 * list starts with "Companies" so a signed-in user can still browse them.
 * Everything a role can reach is listed here, so nothing is reachable only
 * by typing the address by hand.
 */
function accountLinks(user: AuthUser) {
  const companies = { label: "Companies", href: "/companies" };

  if (user.role === "admin") {
    return [
      companies,
      { label: "Moderation queue", href: "/admin" },
      { label: "Manage companies", href: "/admin/companies" },
      { label: "My account", href: "/account" },
    ];
  }

  if (user.role === "company_owner") {
    return [
      companies,
      { label: "My company", href: "/owner" },
      { label: "Register a business", href: "/owner/register" },
      { label: "My account", href: "/account" },
    ];
  }

  // students: "My placements" is the hub for verifying a company and, once
  // approved, reviewing it - so it replaces the old "Get verified" / "Write a
  // review" links, which both live inside that page now.
  return [
    companies,
    { label: "Saved", href: "/saved" },
    { label: "My placements", href: "/my-placements" },
    { label: "My reviews", href: "/my-reviews" },
    { label: "My account", href: "/account" },
  ];
}

// the red "Log out" style, shared by the desktop bar and the mobile menu
const LOGOUT_CLASS =
  "rounded-control border border-danger/40 text-danger hover:bg-danger-tint";

function Navbar() {
  const [open, setOpen] = React.useState(false); // is the mobile menu open?
  const { user, isLoading, logout } = useAuth(); // who is signed in right now

  // one set of links: the account set once logged in, the public set otherwise
  const links = user ? accountLinks(user) : PUBLIC_LINKS;

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

        {/* Desktop links - hidden on mobile (md:flex) */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[14.5px] font-semibold text-ink-secondary hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth area - Log out when signed in, else the two buttons.
            The install button sits first and shows itself only when the app can
            actually be installed. */}
        <div className="hidden items-center gap-3 md:flex">
          <InstallButton className="text-[14.5px] font-semibold text-ink-secondary hover:text-ink" />
          {isLoading ? (
            <span className="text-[14.5px] text-ink-muted">Loading…</span>
          ) : user ? (
            <button
              type="button"
              onClick={logout}
              className={cn(LOGOUT_CLASS, "px-3 py-2 text-[14.5px] font-semibold")}
            >
              Log out
            </button>
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

        {/* Hamburger icon - mobile only */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-control md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)} // flips open/closed each tap
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile dropdown menu - only shows when open is true */}
      <nav id="mobile-menu" aria-label="Main menu" className={cn("flex-col gap-1 border-t border-border px-6 pb-4 pt-2 md:hidden", open ? "flex" : "hidden")}>
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="rounded-control px-2 py-2.5 text-[14.5px] font-semibold text-ink-secondary hover:bg-paper"
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <InstallButton className="rounded-control px-2 py-2.5 text-[14.5px] font-semibold text-ink-secondary hover:bg-paper" />
        {user ? (
          <>
            <p className="px-2 pb-1 pt-3 text-label text-ink-muted">{user.email}</p>
            <button
              type="button"
              className={cn(LOGOUT_CLASS, "mt-2 px-2 py-2.5 text-center font-display text-[15px] font-medium")}
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="mt-2 rounded-control border border-border px-2 py-2.5 text-center font-display text-[15px] font-medium text-ink"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="mt-2 rounded-control bg-primary px-2 py-2.5 text-center font-display text-[15px] font-medium text-white"
              onClick={() => setOpen(false)}
            >
              Create account
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export { Navbar };
