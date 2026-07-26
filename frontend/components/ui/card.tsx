import * as React from "react";

import { cn } from "@/lib/utils";

// A Card is broken into small reusable pieces (Header, Title, Content...)
// so a page can pick and combine only the parts it needs.

// The outer box: white background, border, soft shadow
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      // radius, background and shadow now match the CompanyCard in Figma
      className={cn("rounded-card border border-border bg-white text-ink shadow-soft", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

// Top section of the card (usually holds the title + description)
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-lg", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

// The card title text, e.g. a company name - sized to match Figma's
// "card-title" text style (16px, medium weight)
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    // reusable heading primitive - always given content by its callers
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h3 ref={ref} className={cn("text-card-title text-ink leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

// Smaller subtitle text under the title, e.g. "Software · Kigali"
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-ink-secondary", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

// The main body of the card
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-lg pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

// Bottom row of the card, usually holds a button
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-lg pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };