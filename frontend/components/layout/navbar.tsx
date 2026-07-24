"use client"; // needs useState for the mobile menu and the account menu

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X, ChevronDown } from "lucide-react";

import { useAuth, type AuthUser } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

// The links everyone sees, logged in or not
const PUBLIC_LINKS = [
  { label: "Companies", href: "/companies" },
  { label: "How it works", href: "/how-it-works" },
  { label: "For employers", href: "/employers" },
];

/** The links that belong to this person's account.
 *
 * They live in the account menu rather than the main bar, because each role
 * has three or four of them and putting them all in a row made the header
 * unreadable. Everything a role can reach is listed here, so nothing is
 * reachable only by typing the address by hand.
 */
function accountLinks(user: AuthUser) {
  if (user.role === "admin") {
    return [
      { label: "Moderation queue", href: "/admin" },
      { label: "Manage companies", href: "/admin/companies" },
      { label: "My account", href: "/account" },
    ];
  }

  if (user.role === "company_owner") {
    return [
      { label: "My company", href: "/owner" },
      { label: "Register a business", href: "/owner/register" },
      { label: "My account", href: "/account" },
    ];
  }

  // students: a verified one can write reviews, an unverified one gets
  // pointed at the step that unlocks it.
  // "Write a review" goes to the company list, because a review is always
  // about one company - you pick it there, then its page opens the form.
  return user.is_verified
    ? [
        { label: "Write a review", href: "/companies" },
        { label: "My reviews", href: "/my-reviews" },
        { label: "My account", href: "/account" },
      ]
    : [
        { label: "Get verified", href: "/verify" },
        { label: "My reviews", href: "/my-reviews" },
        { label: "My account", href: "/account" },
      ];
}

function Navbar() {
  const [open, setOpen] = React.useState(false); // is the mobile menu open?
  const [menuOpen, setMenuOpen] = React.useState(false); // is the account menu open?
  const { user, isLoading, logout } = useAuth(); // who is signed in right now

  const links = user ? accountLinks(user) : [];
  const firstName = user ? user.name.split(" ")[0] : "";

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
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14.5px] font-semibold text-ink-secondary hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth area - changes depending on login state */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? (
            <span className="text-[14.5px] text-ink-muted">Loading…</span>
          ) : user ? (
            <>
              {/* the account menu holds every link for this person, so nothing
                  is repeated as a separate button in the bar */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-control border border-border px-3 py-2 text-[14.5px] font-semibold text-ink hover:bg-paper"
                >
                  {firstName}
                  <ChevronDown className="h-4 w-4 text-ink-muted" />
                </button>

                {menuOpen && (
                  <>
                    {/* invisible sheet behind the menu: clicking anywhere closes it */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-card border border-border bg-white py-2 shadow-soft">
                      <p className="px-4 pb-2 text-sm text-ink-muted">{user.email}</p>
                      {links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2 text-[14.5px] text-ink-secondary hover:bg-paper hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        className="mt-1 block w-full border-t border-border px-4 pb-1 pt-3 text-left text-[14.5px] text-ink-secondary hover:text-ink"
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                      >
                        Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
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

        {/* Hamburger icon - mobile only */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-control md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)} // flips open/closed each tap
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu - only shows when open is true.
          No account menu here: on a phone there is room to list everything. */}
      <nav className={cn("flex flex-col gap-1 border-t border-border px-6 pb-4 pt-2 md:hidden", open ? "block" : "hidden")}>
        {PUBLIC_LINKS.map((link) => (
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
            <p className="px-2 pb-1 pt-3 text-label text-ink-muted">{user.email}</p>
            {links.map((link) => (
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
