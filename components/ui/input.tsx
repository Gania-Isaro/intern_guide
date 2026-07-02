import * as React from "react";

import { cn } from "@/lib/utils";

// invalid = shows a red border + ring, used when a form field has an error
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "placeholder:text-muted-foreground", // lighter gray placeholder text
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", // blue glow on focus
          "disabled:cursor-not-allowed disabled:opacity-50", // greyed out + can't click if disabled
          invalid && "border-destructive focus-visible:ring-destructive", // turn red if invalid
          className
        )}
        aria-invalid={invalid || undefined} // tells screen readers this field has an error
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };