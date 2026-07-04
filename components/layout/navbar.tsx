"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

interface NavLink {
  label: string;
  href: string;
}

function getNavLinks(
  role: string | undefined,
  isVerified: boolean | undefined
): NavLink[] {
  if (!role) return [];
  if (role === "admin") {
    return [{ label: "Admin", href: "/admin" }];
  }
  if (role === "company_owner") {
    return [{ label: "My Company", href: "/company" }];
  }
  return isVerified
    ? [{ label: "My Reviews", href: "/dashboard" }]
    : [{ label: "Dashboard", href: "/dashboard" }];
}

const PLACEHOLDER_LINKS: NavLink[] = [
  { label: "Companies", href: "#" },
  { label: "How it works", href: "#" },
  { label: "For employers", href: "#" },
];

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const roleLinks = getNavLinks(user?.role, user?.is_verified);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent-600" strokeWidth={2.25} />
          <span className="text-base font-semibold text-foreground">
            Intern<span className="text-accent-600">Guide</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {PLACEHOLDER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <span className="text-sm text-muted-foreground">Loading…</span>
          ) : user ? (
            <>
              {roleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground hover:text-accent-600"
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
              <Link href="/login">
                <Button variant="link" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Create account
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}