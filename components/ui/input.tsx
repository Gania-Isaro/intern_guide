import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;    // optional text label shown above the field
  invalid?: boolean; // true = show a red border (used for form errors)
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, invalid, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {/* only renders the label if one was passed in */}
        {label && (
          <label htmlFor={id} className="text-label text-ink-secondary">
            {label}
          </label>
        )}
        <input
          id={id}
          className={cn(
            "w-full rounded-control border border-border bg-paper px-3.5 py-3 text-body text-ink",
            "placeholder:text-ink-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            invalid && "border-danger focus-visible:ring-danger", // red border on error
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };