import * as React from "react";

export interface LoadingStateProps {
  label?: React.ReactNode;
  className?: string;
}

export function LoadingState({ label, className }: LoadingStateProps) {
  return (
    <p className={["text-center py-10 text-gray-500", className].filter(Boolean).join(" ")}>
      {label ?? "Loading..."}
    </p>
  );
}