import Link from "next/link";
import { ShieldCheck } from "lucide-react";

// The footer's link columns, grouped by topic
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
      { label: "About THE GRID", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "GitHub", href: "https://github.com/Gania-Isaro/intern_guide" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

function Footer() {
  const year = new Date().getFullYear(); // updates automatically every year

  return (
    <footer className="border-t border-border bg-white">
      <div className="container flex flex-col gap-9 pb-10 pt-14">
        <div className="flex items-start justify-between">
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
              Verified internship reviews — by interns,
              <br />
              for interns.
            </p>
          </div>

          {/* The 3 link columns, built from the array above */}
          <div className="flex gap-[72px]">
            {LINK_COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <p className="text-label text-ink">{col.title}</p>
                {col.links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-[14px] text-ink-secondary hover:text-ink">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Thin divider line */}
        <div className="h-px w-full bg-border" />

        {/* Bottom row: copyright + tech stack */}
        <div className="flex items-center justify-between text-[13px] text-ink-muted">
          <p>© {year} InternGuide · Built by THE GRID · African Leadership University</p>
          <p>Next.js · Flask · MySQL</p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };