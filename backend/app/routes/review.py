from flask import Blueprint, g, jsonify, request

form ..db import get_db
from ..services.rating import compute_overall
from ..utils.decorators import verified_required

bp = Blueprint("review", __name__)

# endpoints: submit review, list approved reviews, my reviews
CATEGORIES = ["mentorship", "tasks", "learning", "environment"]

@bp.post("/reviews")
@verified_required
def create_review():
    data = request.get_json(silent=True) or {}

    company_id = data.get("company_id")
    if not isinstance(company_id, int):
        return jsonify(error="company_id is required"), 400
    
    # every category must be present and an integer between 1 and 5
    scores = {}
    for name in CATEGORIES:
        value = data.get(name)
        if not isinstance(value, int) or not (1 <= value <= 5):
            return jsonify(error=f"{name} must be a whole number between 1 and 5"), 400
        scores[name] = value

    # comment is optional
    comment = (data.get("comment") or "").strip() or None

    cursor = get_db().cursor(dictionary=True)

    cursor.execute("SELECT id FROM companies WHERE id = %s", (company_id,))
    if cursor.fetchone() is None:
        return jsonify(error="company not found"), 404
    
    # one review per user per company
    cursor.execute(
        "SELECT id FROM reviews WHERE user_id = %s AND company_id = %s",
        (g.current_user["id"], company_id)
    )
    if cursor.fetchone() is not None:
        return jsonify(error="you have already submitted a review for this company"), 409
    
    # average rating is computed from the four categories
    rating = compute_overall(scores)

    cursor.execute(
        "INSERT INTO reviews"
        " (company_id, user_id, mentorship, tasks, learning, environment, rating, comment)"
        " VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        (
            company_id,
            g.current_user["id"],
            scores["mentorship"],
            scores["tasks"],
            scores["learning"],
            scores["environment"],
            rating,
            comment
        ),
    )
    get_db().commit()

    return jsonify(
        id=cursor.lastrowid,
        rating=rating,
        status="pending",
        message="Review submitted, an admin will review it before it is published.",
    ), 201