"use client"; // needs useState for hover/click, so it runs in the browser

import * as React from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StarRatingProps {
  value: number;                        // current rating, e.g. 4 or 4.3
  onChange?: (value: number) => void;   // called when a star is clicked
  readOnly?: boolean;                   // true = just display, can't click
  size?: "sm" | "md" | "lg";
  showValue?: boolean;                  // true = also show the number, e.g. "4.3"
  className?: string;
}

const sizeMap = { sm: "h-4 w-4", md: "h-4 w-4", lg: "h-6 w-6" }; // Figma's default star size is 16px

function StarRating({ value, onChange, readOnly = false, size = "md", showValue = false, className }: StarRatingProps) {
  // Tracks which star is being hovered, for a live preview before clicking
  const [hovered, setHovered] = React.useState<number | null>(null);
  const stars = [1, 2, 3, 4, 5];
  const displayValue = hovered ?? value; // show hover preview if hovering, else the real value

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="inline-flex items-center gap-0.5" role={readOnly ? "img" : "radiogroup"}>
        {stars.map((star) => {
          const filled = star <= Math.round(displayValue); // should this star be filled in?
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => !readOnly && setHovered(star)}
              onMouseLeave={() => !readOnly && setHovered(null)}
              className={cn(!readOnly && "cursor-pointer hover:scale-110 transition-transform")}
            >
              <Star
                className={cn(
                  sizeMap[size],
                  // green when filled (the design's only accent color), gray outline when empty
                  filled ? "fill-primary text-primary" : "fill-transparent text-ink-muted"
                )}
              />
            </button>
          );
        })}
      </div>
      {/* optional number next to the stars */}
      {showValue && <span className="text-body text-ink-secondary">{value.toFixed(1)}</span>}
    </div>
  );
}

export { StarRating };