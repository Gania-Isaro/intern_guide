from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash

from ..db import get_db

bp = Blueprint("auth", __name__, url_prefix="/auth")

# admin accounts are created by hand, nobody registers as one
ALLOWED_ROLES = ("student", "company_owner")


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
        cursor.close()
        return jsonify(error="this email is already registered"), 409

    cursor.execute(
        "INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
        (name, email, generate_password_hash(password), role),
    )
    db.commit()
    cursor.close()

    return jsonify(id=cursor.lastrowid, name=name, email=email, role=role), 201
