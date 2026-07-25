# Deploying InternGuide (G2)

Three pieces go live: the MySQL database, the Flask API, and the Next.js
frontend. Any host works; the free tiers of Railway (API + MySQL) and
Vercel (frontend) are the easiest fit for this stack.

## 1. Database (MySQL 8+)

1. Create a MySQL instance and note host, port, user, password.
2. Load the schema, then the seed:
   ```bash
   mysql -h <host> -u <user> -p < database/schema.sql
   mysql -h <host> -u <user> -p internguide < database/seed.sql
   ```

## 2. Backend (Flask + gunicorn)

The repo already has `backend/Procfile` and gunicorn in
`requirements.txt`. Configure these environment variables on the host:

| Variable | What it is |
|---|---|
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | the MySQL instance from step 1 |
| `SECRET_KEY` | a long random string - generate one with `python3 -c "import secrets; print(secrets.token_hex(32))"`. NEVER the example value: it signs the login tokens |
| `FRONTEND_ORIGIN` | the exact frontend URL (e.g. `https://internguide.vercel.app`) - CORS allows only this origin |
| `UPLOAD_ROOT` | a writable folder for proof uploads (e.g. `/data/uploads`) - the code folder may be read-only in production |

Start command (the Procfile does this): `gunicorn "app:create_app()"` from
the `backend/` directory.

## 3. Frontend (Next.js)

1. Import the repo into Vercel and set the **Root Directory** to
   `frontend` (Vercel → Project → Settings → General → Root Directory).
   The Next.js app lives there, not at the repository root.
2. Set one environment variable:
   - `NEXT_PUBLIC_API_URL` = the deployed API URL (no trailing slash)
3. Deploy. Vercel runs `npm run build` on its own.

## 4. Prove it works (5 minutes)

- `GET <api-url>/health` → `{"status": "ok"}`
- open the site → companies load with ratings
- register a student → log in → the dashboard holds
- `admin@internguide.rw` / seed password → moderation queue loads
- upload a proof as an unverified student → approve it as admin →
  the student can now submit a review

## Gotchas we already hit in development

- Flask must NOT run with `debug=True` in production - gunicorn ignores
  `run.py`, so this is handled, just never point the host at `run.py`.
- If uploads fail in production, `UPLOAD_ROOT` is missing or not
  writable - that variable exists precisely for this.
- If login works but every page thinks you're logged out, the cookie is
  being blocked: `FRONTEND_ORIGIN` must match the real frontend URL
  exactly (scheme included), and both sites must be HTTPS.
