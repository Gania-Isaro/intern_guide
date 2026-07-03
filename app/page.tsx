import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          InternGuide
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Verified internship reviews for students in Rwanda. This page
          confirms the scaffold works: Tailwind classes are applied and a
          shadcn/ui-style Button renders below.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="primary">Find internships</Button>
        <Button variant="secondary">Learn more</Button>
      </div>

      <div className="rounded-md border border-border p-4">
        <p className="text-sm text-foreground">
          This card uses a thin border instead of a heavy shadow, an 8–10px
          radius, and the neutral palette, per the team&apos;s design rules.
        </p>
      </div>
    </div>
  );
}