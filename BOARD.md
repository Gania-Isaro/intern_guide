# InternGuide — How We Use the Scrum Board

**Board:** [InternGuide Sprint Board](https://github.com/users/Gania-Isaro/projects/2) · **Repo:** `Gania-Isaro/intern_guide`

We run **4 one-week sprints**. All work lives as GitHub issues on the board.

---

## The 4 columns

| Column | Meaning |
|---|---|
| **Backlog** | Everything not yet scheduled into the current sprint. |
| **To Do** | Pulled into the current sprint, not started yet. |
| **In Progress** | Actively being worked on (one person, one card). |
| **Done** | Merged via PR and meets the Definition of Done. |

Move a card by **dragging** it between columns — its status updates automatically.

---

## How a sprint runs

1. **Sprint start (Monday):** drag this sprint's cards from **Backlog → To Do**. (Sprint 1 is already done for you.)
2. **During the week:** pick a card you own → drag to **In Progress** → when the PR is merged, drag to **Done**.
3. **Sprint end (Friday):** demo what's in Done, hold the retro, then pull the next sprint's cards from Backlog.

**Sprint schedule**
| Sprint | Dates | Focus |
|---|---|---|
| Sprint 1 | Jun 29 – Jul 5 | Foundation, Auth & Setup |
| Sprint 2 | Jul 6 – Jul 12 | Company Discovery & Profiles |
| Sprint 3 | Jul 13 – Jul 19 | Verified Reviews, Proof & Ratings |
| Sprint 4 | Jul 20 – Jul 26 | Admin Moderation, Stretch & Launch |

---

## Reading a card

Each issue is labeled so you can filter the board:

- `epic:*` — which part of the product (foundation, auth, discovery, reviews, admin, ops, owner-stretch)
- `team:backend` / `team:frontend` — which team owns it
- `owner:<name>` — the lead developer for that card
- `priority:high|medium|low` — Must / Should / Could
- `points:*` — story-point estimate
- **Milestone** — which sprint (Sprint 1–4)

**Useful filters** (type in the board's filter bar):
- `milestone:"Sprint 1"` — only this sprint's work
- `label:owner:wilson` — only your cards
- `label:team:frontend` — only frontend work

Tip: **Group by → Milestone** (board ⚙️) shows sprints as swimlanes.

---

## Definition of Done (every card)

- [ ] Code reviewed and merged via PR (no direct pushes to `main`)
- [ ] Meets the issue's acceptance criteria
- [ ] Responsive on desktop + mobile (frontend)
- [ ] Author tested it; the other team smoke-tested it before release
- [ ] API endpoints documented (request/response shape)
- [ ] Merged build runs on the shared/staging environment

---

## Teams

**Backend** — Wilson (lead), Gania, Pascaline · Flask API, MySQL, auth, ratings, moderation
**Frontend** — Aline, Alicia, Ines · Next.js (TS) + Tailwind v3 + shadcn/ui

Link a PR to its issue with `Closes #<number>` in the PR description so the card moves to Done automatically on merge.
