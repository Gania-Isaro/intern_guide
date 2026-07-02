import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { BadgeCheck, Clock, XCircle } from "lucide-react"; // small status icons

import { cn } from "@/lib/utils";

// A Badge is a small pill-shaped label, e.g. "Verified intern".
// This defines all its possible colors/looks.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        success: "border-transparent bg-success/10 text-success",         // green, "verified"
        warning: "border-transparent bg-warning/10 text-warning",         // amber, "pending"
        destructive: "border-transparent bg-destructive/10 text-destructive", // red, "rejected"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// The generic, reusable badge — pick any variant/color
function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

// Ready-made shortcuts for InternGuide's 3 review statuses, so nobody
// has to remember "which color + which icon" every time they need one.
function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="success" className={className}>
      <BadgeCheck className="h-3.5 w-3.5" />
      Verified intern
    </Badge>
  );
}

function PendingBadge({ className }: { className?: string }) {
  return (
    <Badge variant="warning" className={className}>
      <Clock className="h-3.5 w-3.5" />
      Pending review
    </Badge>
  );
}

function RejectedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="destructive" className={className}>
      <XCircle className="h-3.5 w-3.5" />
      Rejected
    </Badge>
  );
}

export { Badge, badgeVariants, VerifiedBadge, PendingBadge, RejectedBadge };