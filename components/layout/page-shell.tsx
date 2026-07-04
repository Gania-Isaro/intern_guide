import * as React from "react";

// Importing from the same folder — "./navbar" means "navbar.tsx sitting right next to this file"
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { cn } from "@/lib/utils";

export interface PageShellProps {
  children: React.ReactNode; // whatever page content gets wrapped, e.g. <h1>Companies</h1>
  className?: string;         // optional extra styling for the content area
}

// Wraps any page with the Navbar on top, Footer on bottom, and the
// page's own content sandwiched in between with consistent width/padding.
// Example usage in a real page:
//   <PageShell><h1>Companies</h1>...</PageShell>
function PageShell({ children, className }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* flex-1 makes this stretch to fill leftover space, pushing the footer to the bottom */}
      <main className={cn("container flex-1 py-2xl", className)}>{children}</main>
      <Footer />
    </div>
  );
}

export { PageShell };