import Link from "next/link";
import { ShieldCheck } from "lucide-react";

// The footer's link columns, grouped by topic.
// "#" means the page is not built yet - clicking it keeps you where you are
// instead of dropping you on a 404.
const LINK_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Browse companies", href: "/companies" },
      { label: "Submit a review", href: "/reviews/new" },
      { label: "How verification works", href: "/how-it-works" },
    ],
  },
  {
    title: "Team",
    links: [
      { label: "About THE GRID", href: "#" },
      { label: "Contact", href: "#" },
      { label: "GitHub", href: "https://github.com/Gania-Isaro/intern_guide" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

function Footer() {
  const year = new Date().getFullYear(); // updates automatically every year

  return (
    <footer className="border-t border-border bg-white">
      <div className="container flex flex-col gap-9 pb-10 pt-14">
        {/* stacks on a phone, sits in a row from md up */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand + tagline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-[18px] w-[18px] text-primary" />
              <span className="font-display text-[16px] font-semibold">
                <span className="text-ink">Intern</span>
                <span className="text-primary">Guide</span>
              </span>
            </div>
            <p className="text-[14px] leading-[22px] text-ink-secondary">
              Verified internship reviews - by interns,
              <br />
              for interns.
            </p>
          </div>

          {/* 2-column grid on a phone (fits 320px), a spaced row from sm up */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:flex sm:gap-12 md:gap-[72px]">
            {LINK_COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <p className="text-label text-ink">{col.title}</p>
                {col.links.map((link) => (
                  // keyed by label, because several links now share the href "#"
                  <Link key={link.label} href={link.href} className="text-[14px] text-ink-secondary hover:text-ink">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Thin divider line */}
        <div className="h-px w-full bg-border" />

        {/* Bottom row: copyright + tech stack - stacks on a phone */}
        <div className="flex flex-col gap-2 text-[13px] text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>© {year} InternGuide · Built by THE GRID · African Leadership University</p>
          <p>Next.js · Flask · MySQL</p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };