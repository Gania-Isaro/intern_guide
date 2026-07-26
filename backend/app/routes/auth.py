import secrets
from datetime import datetime, timedelta, timezone

import jwt
from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from ..db import get_db
from ..extensions import limiter
from ..utils.mailer import send_email

bp = Blueprint("auth", __name__, url_prefix="/auth")

# admin accounts are created by hand, nobody registers as one
ALLOWED_ROLES = ("student", "company_owner")

COOKIE_NAME = "token"
TOKEN_LIFETIME = timedelta(days=1)

# one-time code settings (shared by password reset and email verification)
OTP_TTL_MINUTES = 10   # how long a code stays valid
OTP_MAX_ATTEMPTS = 5   # wrong guesses allowed before the code is burned


def _send_email_verification(cursor, db, user_id, email, name):
    """Generate a fresh email-verification code, store its hash, and email it."""
    code = f"{secrets.randbelow(1_000_000):06d}"
    cursor.execute("DELETE FROM email_verification_codes WHERE user_id = %s", (user_id,))
    cursor.execute(
        "INSERT INTO email_verification_codes (user_id, code_hash, expires_at)"
        " VALUES (%s, %s, NOW() + INTERVAL %s MINUTE)",
        (user_id, generate_password_hash(code), OTP_TTL_MINUTES),
    )
    db.commit()
    try:
        send_email(
            email,
            "Verify your InternGuide email",
            f"Hi {name},\n\n"
            f"Your email verification code is: {code}\n\n"
            f"It expires in {OTP_TTL_MINUTES} minutes. If you did not create an "
            f"InternGuide account, you can ignore this email.\n\n- InternGuide",
        )
    except Exception:
        current_app.logger.exception("Could not send verification email")


@bp.post("/register")
@limiter.limit("5 per minute")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role") or "student"

    if not name or not email or not password:
        return jsonify(error="name, email and password are required"), 400
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify(error="that email does not look valid"), 400
    if len(password) < 8:
        return jsonify(error="password must be at least 8 characters"), 400
    if role not in ALLOWED_ROLES:
        return jsonify(error="role must be student or company_owner"), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        return jsonify(error="this email is already registered"), 409

    cursor.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
        (name, email, generate_password_hash(password), role),
    )
    db.commit()
    user_id = cursor.lastrowid

    # email the verification code; the account cannot log in until it is used
    _send_email_verification(cursor, db, user_id, email, name)
    cursor.close()

    return (
        jsonify(
            message="Account created. We sent a 6-digit code to your email to verify it.",
            email=email,
        ),
        201,
    )


@bp.post("/login")
@limiter.limit("10 per minute")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify(error="email and password are required"), 400

    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    # same message either way, so we don't reveal which emails exist
    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify(error="wrong email or password"), 401

    # the account exists and the password is right, but the email is unconfirmed
    if not user["email_verified"]:
        return (
            jsonify(
                error="Please verify your email first - check your inbox for the code.",
                email_unverified=True,
            ),
            403,
        )

    token = jwt.encode(
        {
            "sub": str(user["id"]),
            "role": user["role"],
            "exp": datetime.now(timezone.utc) + TOKEN_LIFETIME,
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    response = jsonify(id=user["id"], name=user["name"], email=user["email"], role=user["role"])
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=int(TOKEN_LIFETIME.total_seconds()),
        httponly=True,
        secure=current_app.config["COOKIE_SECURE"],
        samesite="Lax",
        # In production the API (api.gania.tech) and frontend
        # (internguide.gania.tech) are different subdomains. Scoping the cookie
        # to the shared parent (.gania.tech) lets BOTH see it, so the frontend's
        # middleware recognises a logged-in user. Empty locally = host-only.
        domain=current_app.config["COOKIE_DOMAIN"],
    )
    return response


@bp.post("/logout")
def logout():
    response = jsonify(message="logged out")
    # must match the domain the cookie was set with, or it won't be cleared
    response.delete_cookie(COOKIE_NAME, domain=current_app.config["COOKIE_DOMAIN"])
    return response


@bp.post("/forgot-password")
@limiter.limit("5 per minute; 20 per hour")
def forgot_password():
    # Step 1 of a reset: the user gives their email and we mail them a code.
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify(error="email is required"), 400

    # First check the email really belongs to a user. If not, say so plainly
    # instead of sending a code, so nobody waits on an email that never comes.
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, name FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if user is None:
        return jsonify(error="this email is not registered"), 404

    code = f"{secrets.randbelow(1_000_000):06d}"  # e.g. "042317"

    # only one active code per user: clear old ones, then store the new (hashed)
    cursor.execute("DELETE FROM password_reset_codes WHERE user_id = %s", (user["id"],))
    cursor.execute(
        "INSERT INTO password_reset_codes (user_id, code_hash, expires_at)"
        " VALUES (%s, %s, NOW() + INTERVAL %s MINUTE)",
        (user["id"], generate_password_hash(code), OTP_TTL_MINUTES),
    )
    db.commit()

    try:
        send_email(
            email,
            "Your InternGuide password reset code",
            f"Hi {user['name']},\n\n"
            f"Your password reset code is: {code}\n\n"
            f"It expires in {OTP_TTL_MINUTES} minutes. If you did not ask to reset "
            f"your password, you can safely ignore this email.\n\n- InternGuide",
        )
    except Exception:
        # The email really did fail to go out. Log the reason (SMTP settings, a
        # network issue, ...) and tell the user so they can try again.
        current_app.logger.exception("Could not send password reset email")
        return jsonify(error="could not send the email, please try again later"), 502

    return jsonify(message="We sent a 6-digit code to your email.")


def _check_reset_code(db, cursor, email, code):
    """Check a reset code without spending it.

    Returns (user_id, code_row, None) when the code is good, or
    (None, None, error_response) when it is not. Wrong guesses count towards
    the attempt limit. Used by BOTH the verify step and the final reset step,
    so the two can never disagree about what a valid code is.
    """
    # one wording for every "no good" case, so nothing is revealed
    bad_code = (jsonify(error="that code is wrong or has expired"), 403)

    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if user is None:
        return None, None, bad_code

    cursor.execute(
        "SELECT id, code_hash, attempts FROM password_reset_codes"
        " WHERE user_id = %s AND used = FALSE AND expires_at > NOW()"
        " ORDER BY id DESC LIMIT 1",
        (user["id"],),
    )
    row = cursor.fetchone()
    if row is None:
        return None, None, bad_code

    # too many wrong guesses: burn this code, they must request a fresh one
    if row["attempts"] >= OTP_MAX_ATTEMPTS:
        cursor.execute(
            "UPDATE password_reset_codes SET used = TRUE WHERE id = %s", (row["id"],)
        )
        db.commit()
        return None, None, (
            jsonify(error="too many wrong tries, please request a new code"),
            429,
        )

    if not check_password_hash(row["code_hash"], code):
        cursor.execute(
            "UPDATE password_reset_codes SET attempts = attempts + 1 WHERE id = %s",
            (row["id"],),
        )
        db.commit()
        return None, None, bad_code

    return user["id"], row, None


@bp.post("/verify-reset-code")
@limiter.limit("15 per minute")
def verify_reset_code():
    # Step 2 of a reset: check ONLY the code. The code is not spent here, so the
    # next step can still use it to actually set the new password.
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    code = (data.get("code") or "").strip()

    if not email or not code:
        return jsonify(error="email and code are required"), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    _, _, error = _check_reset_code(db, cursor, email, code)
    if error is not None:
        return error

    return jsonify(message="Code verified. You can now set a new password.")


@bp.post("/reset-password")
@limiter.limit("10 per minute")
def reset_password():
    # Step 3 of a reset: with a good code, set the new password and spend it.
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    code = (data.get("code") or "").strip()
    new_password = data.get("new_password") or ""

    if not email or not code or not new_password:
        return jsonify(error="email, code and new password are required"), 400
    if len(new_password) < 8:
        return jsonify(error="password must be at least 8 characters"), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    user_id, row, error = _check_reset_code(db, cursor, email, code)
    if error is not None:
        return error

    # correct code: set the new password and mark the code as spent
    cursor.execute(
        "UPDATE users SET password_hash = %s WHERE id = %s",
        (generate_password_hash(new_password), user_id),
    )
    cursor.execute(
        "UPDATE password_reset_codes SET used = TRUE WHERE id = %s", (row["id"],)
    )
    db.commit()

    return jsonify(message="Your password has been reset. You can now log in.")


@bp.post("/verify-email")
@limiter.limit("15 per minute")
def verify_email():
    # A new account confirms its email with the 6-digit code we sent.
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    code = (data.get("code") or "").strip()
    if not email or not code:
        return jsonify(error="email and code are required"), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, email_verified FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    bad = (jsonify(error="that code is wrong or has expired"), 403)
    if user is None:
        return bad
    if user["email_verified"]:
        return jsonify(message="Your email is already verified. You can log in.")

    cursor.execute(
        "SELECT id, code_hash, attempts FROM email_verification_codes"
        " WHERE user_id = %s AND used = FALSE AND expires_at > NOW()"
        " ORDER BY id DESC LIMIT 1",
        (user["id"],),
    )
    row = cursor.fetchone()
    if row is None:
        return bad
    if row["attempts"] >= OTP_MAX_ATTEMPTS:
        cursor.execute(
            "UPDATE email_verification_codes SET used = TRUE WHERE id = %s", (row["id"],)
        )
        db.commit()
        return jsonify(error="too many wrong tries, please request a new code"), 429
    if not check_password_hash(row["code_hash"], code):
        cursor.execute(
            "UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = %s",
            (row["id"],),
        )
        db.commit()
        return bad

    cursor.execute("UPDATE users SET email_verified = TRUE WHERE id = %s", (user["id"],))
    cursor.execute(
        "UPDATE email_verification_codes SET used = TRUE WHERE id = %s", (row["id"],)
    )
    db.commit()
    return jsonify(message="Email verified - you can now log in.")


@bp.post("/resend-verification")
@limiter.limit("5 per minute; 20 per hour")
def resend_verification():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify(error="email is required"), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, name, email_verified FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    # same reply either way, so it can't reveal which emails are registered
    generic = jsonify(message="If that account still needs verifying, a new code is on its way.")
    if user is None or user["email_verified"]:
        return generic
    _send_email_verification(cursor, db, user["id"], email, user["name"])
    return generic


@bp.get("/me")
def me():
    # "Who am I?" - the app asks this on every page load. For a logged-out
    # visitor the honest answer is "nobody", which is a normal 200 reply of
    # null, NOT an error. Returning 401 here made the browser print a red
    # "GET /auth/me 401" line on every anonymous page load; no try/catch can
    # hide that, because the browser logs failed requests itself. So every
    # "not logged in" case below answers 200 with null instead.
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return jsonify(None)

    try:
        payload = jwt.decode(
            token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
        )
    except jwt.InvalidTokenError:
        return jsonify(None)

    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT id, name, email, role, is_verified FROM users WHERE id = %s",
        (payload["sub"],),
    )
    user = cursor.fetchone()
    if user is None:
        return jsonify(None)

    user["is_verified"] = bool(user["is_verified"])
    return jsonify(user)
