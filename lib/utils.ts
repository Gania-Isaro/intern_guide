// clsx: lets us combine class names conditionally, e.g. only add
// "bg-red" if there's an error.
import { type ClassValue, clsx } from "clsx";

// twMerge: fixes conflicts when two Tailwind classes fight over the
// same thing (e.g. "p-2" and "p-4" both set padding — twMerge keeps
// only the last one instead of applying both).
import { twMerge } from "tailwind-merge";

// cn() = "class names". Every component calls this to build its
// final className string. Using one shared helper means every
// component handles custom classes the same, predictable way.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// where the Flask backend runs
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// shared fetch wrapper — sends the auth cookie with every request,
// used by the auth provider for /auth/me and /auth/logout
export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}