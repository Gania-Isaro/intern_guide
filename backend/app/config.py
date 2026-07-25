import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")

    # where the Next.js frontend runs, needed for CORS
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "internguide")

    # keep False for local http, set to true in production where we have https
    COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

    # SMTP email, used to send the "forgot password" code. Fill these in .env.
    # If SMTP_HOST is empty, emailing is simply skipped (the app still runs).
    SMTP_HOST = os.getenv("SMTP_HOST", "")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASS = os.getenv("SMTP_PASS", "")
    SMTP_FROM = os.getenv("SMTP_FROM", "")
    SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "InternGuide")
