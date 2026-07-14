import * as React from "react";

import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;        // must match the id of the input inside it, links the label to the field
  label: string;      // the visible label text, e.g. "Email"
  hint?: string;       // small gray text next to the label, e.g. "Optional"
  error?: string;      // red error message shown below the field, if any
  required?: boolean;  // shows a red * next to the label
  className?: string;
  children: React.ReactNode; // the actual input/textarea/etc. goes here
}

// Wraps any form control (Input, textarea, StarRating...) with a
// consistent label + spacing + error message layout, so every form
// on the site looks the same without copy-pasting this markup.
function FormField({ id, label, hint, error, required, className, children }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>

      {children} {/* this is where <Input id="email" ... /> gets placed by whoever uses FormField */}

      {/* only shows up if there's an error message to display */}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export { FormField };