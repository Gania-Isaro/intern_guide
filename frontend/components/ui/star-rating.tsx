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
  /** Accessible name. Read-only: the whole widget's label (defaults to
   *  "Rated X out of 5"). Interactive: the radio group's label, e.g.
   *  "Mentorship" - required for screen-reader users to know what they rate. */
  label?: string;
  /** id of a hint/error element, wired to the radio group via aria-describedby */
  describedById?: string;
  /** marks the radio group invalid (aria-invalid) when a rating is missing */
  invalid?: boolean;
}

const sizeMap = { sm: "h-4 w-4", md: "h-4 w-4", lg: "h-6 w-6" }; // Figma's default star size is 16px
const STARS = [1, 2, 3, 4, 5];

function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
  showValue = false,
  className,
  label,
  describedById,
  invalid,
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  // declared before the read-only early return so hook order stays stable
  const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const displayValue = hovered ?? value;

  // READ-ONLY: one labelled image; the individual stars are hidden from
  // assistive tech so it announces e.g. "Rated 4.5 out of 5" once, not 5 stars.
  if (readOnly) {
    const rounded = Math.round(value * 10) / 10;
    return (
      <div className={cn("inline-flex items-center gap-1", className)}>
        <div
          className="inline-flex items-center gap-0.5"
          role="img"
          aria-label={label ?? `Rated ${rounded} out of 5`}
        >
          {STARS.map((star) => (
            <Star
              key={star}
              aria-hidden="true"
              className={cn(
                sizeMap[size],
                star <= Math.round(displayValue)
                  ? "fill-primary text-primary"
                  : "fill-transparent text-ink-muted"
              )}
            />
          ))}
        </div>
        {showValue && <span className="text-body text-ink-secondary">{value.toFixed(1)}</span>}
      </div>
    );
  }

  // INTERACTIVE: a real radio group. Roving tabindex (only the chosen star is
  // in the tab order) plus arrow/Home/End keys, so it's fully keyboard-operable.
  function select(next: number) {
    const clamped = Math.min(5, Math.max(1, next));
    onChange?.(clamped);
    btnRefs.current[clamped - 1]?.focus(); // keep focus on the newly chosen star
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        select((value || 0) + 1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        select((value || 1) - 1);
        break;
      case "Home":
        e.preventDefault();
        select(1);
        break;
      case "End":
        e.preventDefault();
        select(5);
        break;
    }
  }

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {/* The group itself isn't a tab stop by design - focus roves across the
          radio buttons inside it (ARIA APG radio-group pattern). */}
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
      <div
        role="radiogroup"
        aria-label={label ?? "Rating"}
        aria-describedby={describedById}
        aria-invalid={invalid || undefined}
        className="inline-flex items-center gap-0.5"
        onKeyDown={onKeyDown}
      >
        {STARS.map((star) => {
          const filled = star <= Math.round(displayValue);
          const checked = star === value;
          return (
            <button
              key={star}
              ref={(el) => {
                btnRefs.current[star - 1] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              // roving tabindex: the chosen star (or the first, when nothing is
              // chosen yet) is the single tab stop for the whole group
              tabIndex={checked || (!value && star === 1) ? 0 : -1}
              onClick={() => select(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              // p-1 makes the hit area 24x24 even though the star is 16px (WCAG 2.5.8)
              className="cursor-pointer rounded p-1 transition-transform hover:scale-110"
            >
              <Star
                aria-hidden="true"
                className={cn(
                  sizeMap[size],
                  filled ? "fill-primary text-primary" : "fill-transparent text-ink-muted"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && <span className="text-body text-ink-secondary">{value.toFixed(1)}</span>}
    </div>
  );
}

export { StarRating };
