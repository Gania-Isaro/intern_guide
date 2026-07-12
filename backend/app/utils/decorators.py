from functools import wraps
import jwt
from flask import current_app, jsonify, request
from ..db import get_db

COOKIE_NAME = "token"

def _get_current_user():
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
    except jwt.InvalidTokenError:
        return None
    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT id, role, is_verified FROM users WHERE id = %s", (payload["sub"],))
    return cursor.fetchone()

def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        def decorated(*args, **kwargs):
            user = _get_current_user()
            if user is None:
                return jsonify(error="not logged in"), 401
            if user["role"] not in roles:
                return jsonify(error="forbidden"), 403
            return fn(*args, **kwargs)
        return decorated
    return wrapper
