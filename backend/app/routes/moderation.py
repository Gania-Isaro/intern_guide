import os

from flask import Blueprint, g, jsonify

from ..db import get_db
from ..services.rating import recompute_company_average
from ..utils.decorators import role_required
from .verification import _upload_folder

bp = Blueprint("moderation", __name__, url_prefix="/admin")

# admin-only endpoints: approve/reject reviews and proofs


@bp.get("/reviews")
@role_required("admin")
def pending_reviews():
    """Every review waiting for a decision, oldest first (fair queue)."""
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT r.id, r.rating, r.mentorship, r.tasks, r.learning, r.environment,"
        " r.comment, r.created_at, u.name AS reviewer_name,"
        " c.id AS company_id, c.name AS company_name"
        " FROM reviews r"
        " JOIN users u ON u.id = r.user_id"
        " JOIN companies c ON c.id = r.company_id"
        " WHERE r.status = 'pending'"
        " ORDER BY r.created_at ASC"
    )
    reviews = cursor.fetchall()
    for review in reviews:
        review["rating"] = float(review["rating"])
        review["created_at"] = review["created_at"].isoformat()
    return jsonify(reviews=reviews, total=len(reviews))