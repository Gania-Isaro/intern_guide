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

@bp.get("/proofs")
@role_required("admin")
def pending_proofs():
    """Every proof of placement waiting for a decision, oldest first."""
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT p.id, p.file_path, p.created_at,"
        " u.id AS student_id, u.name AS student_name, u.email AS student_email,"
        " c.name AS company_name"
        " FROM verification_proofs p"
        " JOIN users u ON u.id = p.user_id"
        " JOIN companies c ON c.id = p.company_id"
        " WHERE p.status = 'pending'"
        " ORDER BY p.created_at ASC"
    )
    proofs = cursor.fetchall()
    for proof in proofs:
        proof["created_at"] = proof["created_at"].isoformat()
        # the admin sees just the stored filename, not a server path
        proof["file_name"] = os.path.basename(proof.pop("file_path") or "")
    return jsonify(proofs=proofs, total=len(proofs))


def _decide_review(review_id, new_status):
    """Approve or reject a review, and recompute the company's average rating."""
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT company_id FROM reviews WHERE id = %s AND status = 'pending'", (review_id,),
    )
    review = cursor.fetchone()
    if review is None:
        return jsonify(error="pending review not found"), 404
    
    cursor.execute(
        "UPDATE reviews SET status = %s WHERE id = %s", (new_status, review_id)
    )
    db.commit()

    recompute_company_average(review["company_id"])
    return jsonify(id=review_id, status=new_status)