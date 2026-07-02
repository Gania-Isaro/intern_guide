from datetime import datetime, timedelta, timezone

import jwt
from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from ..db import get_db

bp = Blueprint("auth", __name__, url_prefix="/auth")

# admin accounts are created by hand, nobody registers as one
ALLOWED_ROLES = ("student", "company_owner")

COOKIE_NAME = "token"
TOKEN_LIFETIME = timedelta(days=1)


@bp.post("/register")
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
        return jsonify(error="this email is already registered"), 409

    cursor.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
        (name, email, generate_password_hash(password), role),
    )
    db.commit()

    return jsonify(id=cursor.lastrowid, name=name, email=email, role=role), 201


@bp.post("/login")
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
    )
    return response


@bp.post("/logout")
def logout():
    response = jsonify(message="logged out")
    response.delete_cookie(COOKIE_NAME)
    return response


@bp.get("/me")
def me():
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return jsonify(error="not logged in"), 401

    try:
        payload = jwt.decode(
            token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
        )
    except jwt.InvalidTokenError:
        return jsonify(error="session expired, please log in again"), 401

    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT id, name, email, role, is_verified FROM users WHERE id = %s",
        (payload["sub"],),
    )
    user = cursor.fetchone()
    if user is None:
        return jsonify(error="not logged in"), 401

    user["is_verified"] = bool(user["is_verified"])
    return jsonify(user)
