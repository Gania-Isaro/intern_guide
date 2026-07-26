# Accessibility (WCAG 2.2 AA)

InternGuide targets **WCAG 2.2 Level AA**. This document records what was done,
how it is enforced, and how to check it yourself.

## Enforced automatically

Every pull request to `develop`/`main` runs two jobs in
`.github/workflows/ci.yml`, which fail the build on any regression:

| Gate | Command | What it catches |
| --- | --- | --- |
| Code-time lint | `npm run lint:a11y` | `eslint-plugin-jsx-a11y` — unlabelled controls, invalid/misused ARIA, missing `alt`, click handlers on non-interactive elements. |
| Public runtime scan (`frontend-a11y`) | `npm run test:a11y` | `axe-core` via Playwright on every public page + the open mobile menu. |
| Authenticated runtime scan (`frontend-a11y-full`) | `E2E_AUTH=1 npm run test:a11y` | the same axe scan on every logged-in page (student, owner, admin), against a same-origin MySQL + Flask stack the job stands up. |

Run locally from `frontend/`:

```bash
npm run lint:a11y                 # fast, no browser
npm run build                     # test:a11y runs against the production build
npm run test:a11y                 # public pages + keyboard specs
E2E_AUTH=1 npm run test:a11y      # ALSO the logged-in pages (needs a local
                                  # backend on the same host, e.g. :5001, and
                                  # the seed data loaded)
```

**Coverage — every route in the app:**
- Public (`e2e/a11y.spec.ts`): `/`, `/companies`, `/companies/1` (rating widgets
  + embedded map), `/compare`, `/how-it-works`, `/employers`, `/login`,
  `/register`, `/verify-email`, `/forgot-password`, and the open mobile menu.
- Authenticated (`e2e/a11y-auth.spec.ts`): `/account`, `/dashboard`, `/saved`,
  `/my-placements`, `/my-reviews`, `/verify`, `/reviews/new`, `/owner`,
  `/owner/company`, `/owner/register`, `/admin`, `/admin/companies`,
  `/admin/companies/1/edit`.
- Keyboard: skip link + mobile menu (`e2e/keyboard.spec.ts`); interactive
  star-rating arrow keys (`e2e/keyboard-auth.spec.ts`).

The authenticated specs reuse a login saved once per role by `e2e/auth.setup.ts`
(seed accounts, password `Password123`). They run only in full-stack mode
(`E2E_AUTH=1`) because the auth cookie needs a same-origin API.

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

Both public and authenticated routes are scanned automatically (see the
coverage list above), so a screen-reader spot-check is the main thing left to a
human.
