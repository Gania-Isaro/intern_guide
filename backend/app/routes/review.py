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

# Two optional questions at the bottom of the review form. They are only ever
# shown added up on the company's charts, and the charts hide themselves when
# too few people answered, one reviewer can never be picked out.
GENDERS = ("female", "male", "other", "prefer_not_to_say")


def _optional_gender(value):
    """Whatever the form sent, or None when it was skipped or unrecognised."""
    text = (value or "").strip()
    return text if text in GENDERS else None


def _optional_year(value):
    """The year the student interned, if it is a sensible one."""
    text = str(value).strip() if value is not None else ""
    if not text.isdigit():
        return None
    year = int(text)
    return year if 2000 <= year <= 2100 else None


@bp.post("/reviews")
@verified_required  # only students whose placement was verified can review
def create_review():
    data = request.get_json(silent=True) or {}

    company_id = data.get("company_id")
    if type(company_id) is not int:
        return jsonify(error="company_id is required"), 400
    
    # every category must be present and an integer between 1 and 5
    scores = {}
    for name in CATEGORIES:
        value = data.get(name)
        if type(value) is not int or not (1 <= value <= 5):
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
        " (company_id, user_id, mentorship, tasks, learning, environment, rating,"
        "  comment, gender, intern_year)"
        " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (
            company_id,
            g.current_user["id"],
            scores["mentorship"],
            scores["tasks"],
            scores["learning"],
            scores["environment"],
            rating,
            comment,
            # both skippable: a blank or odd answer is stored as "not said"
            _optional_gender(data.get("gender")),
            _optional_year(data.get("intern_year")),
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


# ---------- F3: a company owner replies to a review ----------

@bp.post("/reviews/<int:review_id>/reply")
@role_required("company_owner")
def reply_to_review(review_id):
    """One public reply per review, written by the company's owner.

    Owners only see (and answer) APPROVED reviews - pending and rejected
    ones don't exist for them. The reply appears on the company page
    right under the review.
    """
    body = ((request.get_json(silent=True) or {}).get("body") or "").strip()
    if not body:
        return jsonify(error="reply text is required"), 400

    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT r.id, c.owner_id FROM reviews r"
        " JOIN companies c ON c.id = r.company_id"
        " WHERE r.id = %s AND r.status = 'approved'",
        (review_id,),
    )
    review = cursor.fetchone()
    if review is None:
        return jsonify(error="review not found"), 404
    if review["owner_id"] != g.current_user["id"]:
        return jsonify(error="you can only reply to reviews of your own company"), 403

    # one reply per review - a conversation belongs in person, not here
    cursor.execute("SELECT id FROM replies WHERE review_id = %s", (review_id,))
    if cursor.fetchone() is not None:
        return jsonify(error="this review already has a reply"), 409

    cursor.execute(
        "INSERT INTO replies (review_id, user_id, body) VALUES (%s, %s, %s)",
        (review_id, g.current_user["id"], body),
    )
    get_db().commit()
    return jsonify(id=cursor.lastrowid, review_id=review_id, body=body), 201