# InternGuide

Verified internship reviews - by interns, for interns. Students prove
they interned at a company, rate it across four categories, and their
reviews go public after admin approval. Built by **team THE GRID** (ALU).

## The stack

- **Frontend:** Next.js (App Router) + React + TypeScript + Tailwind CSS
- **Backend:** Flask (Python) + MySQL, JWT cookie sessions
- **Tests:** pytest (backend) and Vitest (frontend)

## Repo layout

```
frontend/   Next.js app (pages, components, tests, package.json)
backend/    Flask API (app, tests, requirements.txt)
database/   schema.sql and seed.sql
docs/       deployment and technical docs
```

Each side owns its own dependencies and config - run `npm` commands from
`frontend/`, and Python commands from `backend/`.

## Run it locally

You need: Node 20+, Python 3.12+, MySQL 8+.

### 1. Database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p internguide < database/seed.sql
```

### 2. Backend (Flask on port 5001)

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env        # then fill in your MySQL user + a secret key
.venv/bin/flask --app app run --port 5001 --debug
```

Check it: `curl http://localhost:5001/health` → `{"status":"ok"}`.
(Port 5001 because macOS AirPlay squats on 5000.)

### 3. Frontend (Next.js on port 3000)

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5001" > .env.local
npm run dev
```

Open http://localhost:3000.

## Seed logins (password `Password123` for all)

| Email | Who |
|---|---|
| `aline@alustudent.com` | student, verified - can write reviews |
| `sandrine@alustudent.com` | student, not verified - sees the proof-upload flow |
| `grace@kivusoftware.rw` | company owner - owner dashboard, replies |
| `admin@internguide.rw` | admin - moderation queue, manage companies |

## Tests

```bash
cd backend   && .venv/bin/python -m pytest -q   # backend suite
cd frontend  && npm test                        # frontend suite
```

## How the trust model works

1. A student uploads proof of their placement (pdf/png/jpg, max 5 MB).
2. An admin approves it → the student becomes a verified intern; the
   uploaded file is deleted for privacy - only the decision is kept.
3. Verified interns submit reviews (4 star categories + comment).
4. Reviews are born `pending`; an admin approves or rejects each one.
5. Only approved reviews appear publicly, and only they count toward a
   company's average rating. Company owners may post one public reply
   per review.

## Deploying

See [docs/DEPLOY.md](docs/DEPLOY.md).
