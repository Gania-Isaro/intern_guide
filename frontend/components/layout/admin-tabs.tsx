"use client";

// The two admin pages used to have no way of reaching each other - you had to
// know the address. This bar sits at the top of both of them.

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Moderation queue", href: "/admin" },
  { label: "Companies", href: "/admin/companies" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-border">
      {TABS.map((tab) => {
        // "/admin/companies/2/edit" should still light up the Companies tab
        const active =
          tab.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              active
                ? "-mb-px border-b-2 border-primary px-4 py-3 text-[14.5px] font-semibold text-primary"
                : "-mb-px border-b-2 border-transparent px-4 py-3 text-[14.5px] font-semibold text-ink-secondary hover:text-ink"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
