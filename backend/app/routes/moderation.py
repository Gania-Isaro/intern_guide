from flask import Blueprint

bp = Blueprint("moderation", __name__, url_prefix="/admin")

# admin-only endpoints: approve/reject reviews and proofs
