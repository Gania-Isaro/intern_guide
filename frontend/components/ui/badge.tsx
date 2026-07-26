import * as React from "react";
import { ShieldCheck, Clock, X } from "lucide-react"; // icons for each status

import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "verified" | "pending" | "rejected"; // which of the 3 states to show
}

// A small pill-shaped label. Pass a status and it picks the right
// color, icon, and text automatically.
function Badge({ className, status = "verified", ...props }: BadgeProps) {
  const styles = {
    verified: "bg-primary-tint text-primary-deep",   // light green (deep text for AA contrast)
    pending: "bg-pending-tint text-pending",     // light amber
    rejected: "bg-danger-tint text-danger",      // light red
  };
  const icons = { verified: ShieldCheck, pending: Clock, rejected: X };
  const labels = { verified: "Verified", pending: "Pending", rejected: "Rejected" };
  const Icon = icons[status]; // pick the right icon component for this status

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-3 py-1.5 text-badge",
        styles[status],
        className
      )}
      {...props}
    >
      <Icon className="h-3.5 w-3.5" />
      {labels[status]}
    </div>
  );
}

export { Badge };