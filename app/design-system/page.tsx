"use client"; // this page has interactive parts (star rating, dialog), so it runs in the browser

import * as React from "react";

// Import everything from our one barrel file (components/ui/index.ts)
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  VerifiedBadge,
  PendingBadge,
  RejectedBadge,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  StarRating,
  FormField,
} from "@/components/ui";

// This is the actual page shown at yoursite.com/design-system.
// It's a living reference: every component gets demoed here so the
// team can see what's available before building a real page.
export default function DesignSystemPage() {
  // Shared rating value used by both the star-rating demo and the dialog demo
  const [rating, setRating] = React.useState(0);

  return (
    <main className="container mx-auto flex max-w-4xl flex-col gap-2xl py-2xl">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">InternGuide Design System</h1>
        <p className="text-muted-foreground">
          Shared tokens and components. Import from{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">@/components/ui</code> — don't
          copy-paste markup between pages.
        </p>
      </header>

      {/* ---- Color swatches ---- */}
      <Section title="Color tokens">
        <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
          <Swatch name="primary" className="bg-primary" />
          <Swatch name="secondary" className="bg-secondary border" />
          <Swatch name="success" className="bg-success" />
          <Swatch name="warning" className="bg-warning" />
          <Swatch name="destructive" className="bg-destructive" />
          <Swatch name="muted" className="bg-muted border" />
          <Swatch name="border" className="bg-border" />
          <Swatch name="background" className="bg-background border" />
        </div>
      </Section>

      {/* ---- Font sizes ---- */}
      <Section title="Typography">
        <div className="flex flex-col gap-2">
          <p className="text-4xl font-bold">Heading 4xl / bold</p>
          <p className="text-3xl font-bold">Heading 3xl / bold</p>
          <p className="text-2xl font-semibold">Heading 2xl / semibold</p>
          <p className="text-xl font-semibold">Heading xl / semibold</p>
          <p className="text-lg">Lead paragraph — lg / regular</p>
          <p className="text-base">Body copy — base / regular</p>
          <p className="text-sm text-muted-foreground">Secondary text — sm / muted</p>
          <p className="text-xs text-muted-foreground">Caption / helper text — xs / muted</p>
        </div>
      </Section>

      {/* ---- Every button variant + size ---- */}
      <Section title="Button">
        <div className="flex flex-wrap items-center gap-md">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button loading>Saving…</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-md flex flex-wrap items-center gap-md">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      {/* ---- Status badges ---- */}
      <Section title="Badge (review / verification status)">
        <div className="flex flex-wrap items-center gap-md">
          <VerifiedBadge />
          <PendingBadge />
          <RejectedBadge />
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Section>

      {/* ---- Star rating: read-only vs interactive ---- */}
      <Section title="Star rating">
        <div className="flex flex-col gap-md">
          <div>
            <p className="mb-1 text-sm text-muted-foreground">Read-only (company card average)</p>
            <StarRating value={4.3} readOnly showValue />
          </div>
          <div>
            <p className="mb-1 text-sm text-muted-foreground">Interactive (review form input)</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
        </div>
      </Section>

      {/* ---- Form field examples: normal, with hint, with error ---- */}
      <Section title="Form field + Input">
        <div className="flex max-w-sm flex-col gap-lg">
          <FormField id="email" label="Email" required>
            <Input id="email" type="email" placeholder="you@alustudent.com" />
          </FormField>
          <FormField id="password" label="Password" hint="Min. 8 characters">
            <Input id="password" type="password" />
          </FormField>
          <FormField id="bad" label="Company name" required error="This field is required.">
            <Input id="bad" invalid placeholder="e.g. Kigali Tech Ltd" />
          </FormField>
        </div>
      </Section>

      {/* ---- Example: a real company card using several components together ---- */}
      <Section title="Card (company listing example)">
        <Card className="max-w-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Kigali Tech Ltd</CardTitle>
              <VerifiedBadge />
            </div>
            <CardDescription>Software · Kigali</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <StarRating value={4.3} readOnly showValue />
            <p className="text-sm text-muted-foreground">
              12 verified reviews · mentorship rated highly by past interns.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">View reviews</Button>
          </CardFooter>
        </Card>
      </Section>

      {/* ---- Working dialog you can actually open/close ---- */}
      <Section title="Dialog / Modal">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open review dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit your review</DialogTitle>
              <DialogDescription>
                Only verified interns can submit a review. Your placement will be checked before this
                goes live.
              </DialogDescription>
            </DialogHeader>
            <div className="py-md">
              <StarRating value={rating} onChange={setRating} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button>Submit review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>
    </main>
  );
}

// Small helper: a labeled section with a divider line above it.
// Used repeatedly above instead of repeating this markup every time.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-md border-t border-border pt-lg first:border-t-0 first:pt-0">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

// Small helper: a colored box + its name, used in the color tokens section
function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className={`h-14 w-full rounded-md ${className}`} />
      <span className="text-xs text-muted-foreground">{name}</span>
    </div>
  );
}