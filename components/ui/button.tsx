import * as React from "react";
import { Slot } from "@radix-ui/react-slot"; // lets the button "become" another element, like a Link
import { cva, type VariantProps } from "class-variance-authority"; // helps manage multiple style variants
import { Loader2 } from "lucide-react"; // the spinning loading icon

import { cn } from "@/lib/utils";

// Defines every visual style ("variant") the button can have, and every
// size. cva() just builds the right Tailwind classes for whichever
// variant + size gets picked.
const buttonVariants = cva(
  // base classes applied to EVERY button no matter the variant
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium " +
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // different LOOKS for the button
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",       // solid blue
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", // light gray
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground", // just an outline
        ghost: "hover:bg-accent hover:text-accent-foreground",                    // no background until hovered
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90", // red, for delete/reject
        link: "text-primary underline-offset-4 hover:underline",                  // looks like a text link
      },
      // different SIZES for the button
      size: {
        sm: "h-8 rounded-md px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-6",
        icon: "h-10 w-10", // square, for icon-only buttons
      },
    },
    // if nobody specifies variant/size, use these
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// The props (settings) this component accepts, on top of normal
// HTML button attributes like onClick.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;  // if true, render as whatever child is passed (e.g. a <Link>) instead of <button>
  loading?: boolean;  // if true, shows a spinner and disables clicking
}

// forwardRef lets a parent component grab a direct reference to the
// actual <button> DOM element if it ever needs to (e.g. to focus it).
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    // Decide whether to render a real <button> or "become" the child element
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading} // can't click while loading
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} {/* spinner shows only when loading */}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button"; // helps React DevTools show a readable name

export { Button, buttonVariants };