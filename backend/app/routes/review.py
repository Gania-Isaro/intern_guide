# Reviews: submit one (D1, Wilson), read a company's approved ones (D7)
# and read your own with their status (D8).
#
# The blueprint has no url_prefix because the routes live on different
# paths (/reviews and /me/reviews), so each one spells out its full path.

from flask import Blueprint, g, jsonify, request

from ..db import get_db
from ..services.rating import compute_overall
from ..utils.decorators import role_required, verified_required

bp = Blueprint("review", __name__)

# the four things a student scores, 1-5 stars each
CATEGORIES = ("mentorship", "tasks", "learning", "environment")


@bp.post("/reviews")
@verified_required  # only students whose placement was verified can review
def create_review():
    data = request.get_json(silent=True) or {}

    company_id = data.get("company_id")
    if not isinstance(company_id, int):
        return jsonify(error="company_id is required"), 400

    # every category must be a whole number from 1 to 5
    scores = {}
    for name in CATEGORIES:
        value = data.get(name)
        if not isinstance(value, int) or not 1 <= value <= 5:
            return jsonify(error=f"{name} must be a whole number from 1 to 5"), 400
        scores[name] = value

    # the comment is optional; an empty string counts as no comment
    comment = (data.get("comment") or "").strip() or None

    cursor = get_db().cursor(dictionary=True)

    cursor.execute("SELECT id FROM companies WHERE id = %s", (company_id,))
    if cursor.fetchone() is None:
        return jsonify(error="company not found"), 404

    # one review per student per company (the DB also enforces this)
    cursor.execute(
        "SELECT id FROM reviews WHERE user_id = %s AND company_id = %s",
        (g.current_user["id"], company_id),
    )
    if cursor.fetchone() is not None:
        return jsonify(error="you have already reviewed this company"), 409

    # the overall rating is the average of the four category scores
    rating = compute_overall(scores)

    # status is not set here — the table defaults it to 'pending', and only
    # an admin can move it to approved or rejected
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
            comment,
        ),
    )
    get_db().commit()

    return (
        jsonify(
            id=cursor.lastrowid,
            rating=rating,
            status="pending",
            message="review submitted — an admin will check it before it goes live",
        ),
        201,
    )


# ---------- D7: read a company's approved reviews ----------

@bp.get("/reviews")
def list_reviews():
    """Approved reviews for one company, newest first.

    Usage: GET /reviews?company_id=1
    Pending and rejected reviews never appear here.
    """
    company_id = request.args.get("company_id", type=int)
    if company_id is None:
        return jsonify(error="company_id is required"), 400

    cursor = get_db().cursor(dictionary=True)

    cursor.execute("SELECT id FROM companies WHERE id = %s", (company_id,))
    if cursor.fetchone() is None:
        return jsonify(error="company not found"), 404

    cursor.execute(
        "SELECT r.id, r.rating, r.mentorship, r.tasks, r.learning, r.environment,"
        " r.comment, r.created_at, u.name AS reviewer_name,"
        " u.is_verified AS reviewer_verified"
        " FROM reviews r JOIN users u ON u.id = r.user_id"
        " WHERE r.company_id = %s AND r.status = 'approved'"
        " ORDER BY r.created_at DESC",
        (company_id,),
    )
    reviews = cursor.fetchall()

    # make every value JSON-friendly
    for review in reviews:
        review["rating"] = float(review["rating"])
        review["reviewer_verified"] = bool(review["reviewer_verified"])
        review["created_at"] = review["created_at"].isoformat()

    return jsonify(reviews=reviews, total=len(reviews))


# ---------- D8: the logged-in student's own reviews ----------

@bp.get("/me/reviews")
@role_required("student")
def my_reviews():
    """Everything I have submitted, with its status (pending/approved/rejected)."""
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT r.id, r.rating, r.mentorship, r.tasks, r.learning, r.environment,"
        " r.comment, r.status, r.created_at, c.name AS company_name, c.id AS company_id"
        " FROM reviews r JOIN companies c ON c.id = r.company_id"
        " WHERE r.user_id = %s"
        " ORDER BY r.created_at DESC",
        (g.current_user["id"],),
    )
    reviews = cursor.fetchall()

    for review in reviews:
        review["rating"] = float(review["rating"])
        review["created_at"] = review["created_at"].isoformat()

    return jsonify(reviews=reviews)