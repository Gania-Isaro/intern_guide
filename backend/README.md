# InternGuide backend

Flask REST API for InternGuide. The frontend talks to this API only, never to MySQL directly.

## Run it locally

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then edit .env
flask --app run.py run
```

Check it works: `curl http://localhost:5000/health` should return `{"status": "ok"}`.
