# Accessibility (WCAG 2.2 AA)

InternGuide targets **WCAG 2.2 Level AA**. This document records what was done,
how it is enforced, and how to check it yourself.

## Enforced automatically

Every pull request to `develop`/`main` runs the `frontend-a11y` job in
`.github/workflows/ci.yml`, which fails the build on any regression:

| Gate | Command | What it catches |
| --- | --- | --- |
| Code-time lint | `npm run lint:a11y` | `eslint-plugin-jsx-a11y` — unlabelled controls, invalid/misused ARIA, missing `alt`, click handlers on non-interactive elements. |
| Runtime scan | `npm run test:a11y` | `axe-core` via Playwright — contrast, name/role/value, landmarks, labels, ARIA validity — on every key page. |

Run both locally from `frontend/`:

```bash
npm run lint:a11y      # fast, no browser
npm run build          # test:a11y runs against the production build
npm run test:a11y      # axe scan + keyboard specs (starts the server itself)
```

The axe scan lives in `e2e/a11y.spec.ts` and covers: `/`, `/companies`,
`/companies/1` (rating widgets + embedded map), `/compare`, `/how-it-works`,
`/employers`, `/login`, `/register`, `/verify-email`, `/forgot-password`, and
the open mobile menu. `e2e/keyboard.spec.ts` verifies the skip link and the
mobile-menu button's keyboard operation and `aria-expanded` state.

## What was implemented

**Foundations (`app/globals.css`, `app/layout.tsx`)**
- Visible `:focus-visible` ring on every interactive element (2.4.7).
- "Skip to main content" link, first in the tab order (2.4.1).
- `prefers-reduced-motion` honoured for animations/transitions (2.3.3).
- `<main id="main-content">` landmark as the skip target.

**Colour contrast (`app/globals.css`, `tailwind.config.ts`)**
- `--ink-muted` darkened 61%→40% L: 2.65:1 → ~5.4:1 (1.4.3).
- `--pending` darkened so the badge clears AA on its tint (4.03:1 → ~5.1:1).
- Verified badge uses `text-primary-deep` (4.28:1 → 6.66:1).
- Auth pages moved off raw Tailwind palette (`green-600` = 3.29:1) onto the
  AA-passing design tokens; inline links are underlined so they are not
  distinguished by colour alone (1.4.1).
- Restored the `accent` colour scale (was undefined) mapped to the green tokens.

**Components**
- `StarRating`: read-only renders one labelled `role="img"`
  ("Rated X out of 5"); interactive is an ARIA radio group with roving
  tabindex, arrow/Home/End keys, `aria-checked`, and 24×24 hit targets
  (1.1.1, 2.5.8, 4.1.2).
- Forms (`login`, `register`, `verify-email`, `forgot-password`, `reviews/new`):
  `aria-invalid` + `aria-describedby` link inputs to their errors, and messages
  use `role="alert"` so they are announced (3.3.1, 4.1.3). Shared
  `components/ui/field-error.tsx`.
- `PasswordInput`: reveal toggle is keyboard-reachable with a clear label and
  `aria-pressed`; icons are `aria-hidden`.
- Navbar hamburger: `aria-expanded` + `aria-controls`; decorative icons hidden.

## Manual verification

Beyond the automated gates, the following were checked by hand and should be
re-checked when shared components change:

- **Keyboard only:** tab through every public page — skip link works, focus is
  always visible, no keyboard trap, dialogs close on `Escape` and restore focus
  (Radix), star ratings settable with arrow keys.
- **Screen reader (VoiceOver):** form errors announced on submit, star ratings
  read as their score, badges and icon-only buttons have names.

Authenticated pages (dashboards, admin/owner tables, saved, my-reviews) reuse
the same audited primitives (Card, Badge, Button, inputs, Dialog, StarRating);
verify them manually when logged in, as CI scans the public routes.
