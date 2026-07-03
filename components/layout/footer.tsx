import Link from "next/link";

function Footer() {
  // Computes the current year automatically, so nobody has to remember
  // to manually update "© 2026" every January.
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container flex flex-col items-center gap-4 py-10 text-sm text-muted-foreground md:flex-row md:justify-between">
        <p>© {year} InternGuide · African Leadership University, Kigali</p>
        <nav className="flex items-center gap-6">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/companies" className="hover:text-foreground">
            Companies
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export { Footer };