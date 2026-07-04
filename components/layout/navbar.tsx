"use client";

import Link from "next/link";
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

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const navLinks = getNavLinks(user?.role, user?.is_verified);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold text-foreground">
          InternGuide
        </Link>

        <nav className="flex items-center gap-4">
          {isLoading ? (
            <span className="text-sm text-muted-foreground">Loading…</span>
          ) : user ? (
            <>
              {navLinks.map((link) => (
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
            <Link href="/login">
              <Button variant="primary" size="sm">
                Log in
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}