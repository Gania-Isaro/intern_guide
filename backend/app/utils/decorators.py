from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt
from flask import jsonify

def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorated(*args, **kwargs):
            if get_jwt().get("role") not in roles:
                return jsonify({"error": "forbidden"}), 403
            return fn(*args, **kwargs)
        return decorated
    return wrapper

def verified_required(fn):
    @wraps(fn)
    @jwt_required()
    def decorated(*args, **kwargs):
        if not get_jwt().get("is_verified"):
            return jsonify({"error": "account not verified"}), 403
        return fn(*args, **kwargs)
    return decorated