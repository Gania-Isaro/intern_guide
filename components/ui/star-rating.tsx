"use client"; // needs useState for clicking/hovering, so it must run in the browser

import * as React from "react";
import { Star } from "lucide-react"; // the star icon, filled or outline

import { cn } from "@/lib/utils";

export interface StarRatingProps {
  value: number;                        // the current rating, e.g. 4 or 4.3
  onChange?: (value: number) => void;   // called when the user clicks a star (leave empty for display-only)
  readOnly?: boolean;                   // true = just showing a rating, can't be clicked
  size?: "sm" | "md" | "lg";
  showValue?: boolean;                  // true = also show the number next to the stars, e.g. "4.3"
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

function StarRating({ value, onChange, readOnly = false, size = "md", showValue = false, className }: StarRatingProps) {
  // Tracks which star the mouse is currently hovering over, so stars
  // light up as a preview before the user actually clicks.
  const [hovered, setHovered] = React.useState<number | null>(null);

  const stars = [1, 2, 3, 4, 5];
  // While hovering, show the hover preview; otherwise show the real value
  const displayValue = hovered ?? value;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div
        className="inline-flex items-center gap-0.5"
        role={readOnly ? "img" : "radiogroup"} // helps screen readers understand this is a rating
        aria-label={readOnly ? `Rated ${value} out of 5 stars` : "Rate this internship out of 5 stars"}
      >
        {stars.map((star) => {
          // Should THIS star be filled in, based on the rounded rating?
          const filled = star <= Math.round(displayValue);
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly} // can't click stars in read-only mode
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              aria-pressed={!readOnly && value === star}
              onClick={() => onChange?.(star)}                    // tell the parent component the new rating
              onMouseEnter={() => !readOnly && setHovered(star)}   // start hover preview
              onMouseLeave={() => !readOnly && setHovered(null)}   // end hover preview
              className={cn(
                "transition-transform",
                !readOnly && "cursor-pointer hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
                readOnly && "cursor-default"
              )}
            >
              <Star
                className={cn(
                  sizeMap[size],
                  // filled stars are amber/orange, empty stars are gray outlines
                  filled ? "fill-warning text-warning" : "fill-transparent text-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>
      {/* optional number next to the stars, e.g. "4.3" */}
      {showValue && <span className="text-sm text-muted-foreground">{value.toFixed(1)}</span>}
    </div>
  );
}

export { StarRating };