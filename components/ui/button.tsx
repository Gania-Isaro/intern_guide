import * as React from "react";
import { Slot } from "@radix-ui/react-slot"; // lets the button "become" another element, like a Link
import { cva, type VariantProps } from "class-variance-authority"; // manages multiple style variants
import { Loader2 } from "lucide-react"; // spinning loading icon

import { cn } from "@/lib/utils";

// Defines the 3 button looks: Primary (solid green), Secondary (white
// with a border), and Ghost (no background, green text only).
const buttonVariants = cva(
  // classes applied to every button no matter the variant
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control px-6 py-3 " +
    "font-display font-medium text-[15px] transition-colors focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",     // solid green
        secondary: "bg-white border border-border text-ink hover:bg-paper",    // outlined
        ghost: "text-primary hover:bg-primary-tint",                           // text only
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;  // if true, renders as the child element (e.g. a Link) instead of <button>
  loading?: boolean;  // if true, shows a spinner and disables clicking
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} {/* spinner only shows while loading */}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };