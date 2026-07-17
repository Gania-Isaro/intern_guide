import * as React from "react";

export interface EmptyStateProps {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  message?: string; // backward-compatible single-string API
  className?: string;
}

export function EmptyState({ title, description, action, message, className }: EmptyStateProps) {
  const body = description ?? message ?? "Nothing here yet.";
  return (
    <div className={["mx-auto max-w-lg py-10", className].filter(Boolean).join(" ")}>
      <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-white p-lg shadow-soft">
        {title && <h2 className="font-display text-card-title text-ink">{title}</h2>}
        <p className="text-body text-ink-secondary text-center">{body}</p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}