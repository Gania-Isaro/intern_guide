// clsx: lets us combine class names conditionally, e.g. only add
// "bg-red" if there's an error.
import { type ClassValue, clsx } from "clsx";

// twMerge: fixes conflicts when two Tailwind classes fight over the
// same thing (e.g. "p-2" and "p-4" both set padding — twMerge keeps
// only the last one instead of applying both).
import { twMerge } from "tailwind-merge";

// cn() = "class names". Every component below calls this to build its
// final className string. Using one shared helper means every
// component handles custom classes the same, predictable way.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}