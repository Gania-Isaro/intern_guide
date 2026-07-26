from flask import Blueprint, g, jsonify, request

from ..db import get_db
from ..utils.decorators import role_required

bp = Blueprint("bookmarks", __name__)

# Saved / bookmarked companies. Any logged-in user can keep a shortlist.
ANY_USER = ("student", "company_owner", "admin")


@bp.get("/me/bookmark-ids")
@role_required(*ANY_USER)
def bookmark_ids():
    """Just the ids, so the company cards can show a filled/empty heart."""
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT company_id FROM bookmarks WHERE user_id = %s", (g.current_user["id"],)
    )
    return jsonify(company_ids=[row["company_id"] for row in cursor.fetchall()])


@bp.post("/me/bookmarks")
@role_required(*ANY_USER)
def add_bookmark():
    data = request.get_json(silent=True) or {}
    company_id = data.get("company_id")
    if not isinstance(company_id, int):
        return jsonify(error="company_id is required"), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM companies WHERE id = %s", (company_id,))
    if cursor.fetchone() is None:
        return jsonify(error="company not found"), 404

    # INSERT IGNORE so saving something already saved is a harmless no-op
    cursor.execute(
        "INSERT IGNORE INTO bookmarks (user_id, company_id) VALUES (%s, %s)",
        (g.current_user["id"], company_id),
    )
    db.commit()
    return jsonify(message="saved"), 201


@bp.delete("/me/bookmarks/<int:company_id>")
@role_required(*ANY_USER)
def remove_bookmark(company_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "DELETE FROM bookmarks WHERE user_id = %s AND company_id = %s",
        (g.current_user["id"], company_id),
    )
    db.commit()
    return jsonify(message="removed")


@bp.get("/me/bookmarks")
@role_required(*ANY_USER)
def list_bookmarks():
    """The saved companies, newest first, with the fields the cards need."""
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT c.id, c.name, c.industry, c.location, c.average_rating,"
        " (SELECT COUNT(*) FROM reviews r"
        "    WHERE r.company_id = c.id AND r.status = 'approved') AS review_count,"
        " (SELECT COUNT(*) FROM reviews r JOIN users u ON u.id = r.user_id"
        "    WHERE r.company_id = c.id AND r.status = 'approved'"
        "      AND u.is_verified = TRUE) AS verified_count"
        " FROM bookmarks b JOIN companies c ON c.id = b.company_id"
        " WHERE b.user_id = %s"
        " ORDER BY b.created_at DESC",
        (g.current_user["id"],),
    )
    companies = cursor.fetchall()
    for company in companies:
        if company["average_rating"] is not None:
            company["average_rating"] = float(company["average_rating"])
    return jsonify(companies=companies)
