from datetime import date

from flask import Blueprint, g, jsonify, request

from ..db import get_db
from ..utils.decorators import role_required

bp = Blueprint("manage", __name__)

# Fields that users are allowed to edit.
COMPANY_FIELDS = (
    "name",
    "description",
    "industry",
    "location",
    "website",
    "google_address",
    "size",
    "founded_year",
)

SIZES = ("1-10", "11-50", "51-200", "200+")

# What a company offers its interns. Kept here rather than in the database so
# adding a perk is a one-line change; company_amenities just stores the names.
AMENITIES = (
    "meals",
    "transport_allowance",
    "health_insurance",
    "laptop_provided",
    "accommodation",
    "training_program",
    "mentorship_program",
    "certificate",
    "return_offer",
    "flexible_hours",
)

# Pay, place and hours belong to the posting rather than the company: the same
# employer can run a paid engineering internship and an unpaid marketing one.
COMPENSATION_TYPES = ("paid", "stipend", "unpaid", "academic_credit", "intern_pays")
WORK_MODES = ("onsite", "hybrid", "remote")
SCHEDULES = ("full_time", "part_time", "flexible")
STIPEND_PERIODS = ("hour", "week", "month", "total")

def _positive_number(value):
    """A whole number above zero, or None. Empty form fields arrive as ''."""
    text = str(value).strip() if value is not None else ""
    if not text.isdigit():
        return None
    number = int(text)
    return number if number > 0 else None


def _clean_company_fields(data):
    # Remove extra spaces and keep only allowed fields.
    cleaned = {}
    for field in COMPANY_FIELDS:
        if field in data:
            if field == "founded_year":
                # comes off a number input, so it may arrive as "" or as an int
                value = data.get(field)
                cleaned[field] = int(value) if str(value).strip().isdigit() else None
            else:
                value = (data.get(field) or "").strip()
                cleaned[field] = value or None
    return cleaned


def _field_problem(fields):
    """The message to send back when a value is not allowed, else None."""
    if fields.get("size") and fields["size"] not in SIZES:
        return "size must be one of: " + ", ".join(SIZES)
    year = fields.get("founded_year")
    if year is not None and not (1900 <= year <= 2100):
        return "founded year must be a real year"
    return None



# Admin creates a new company.
@bp.post("/companies")
@role_required("admin")
def create_company():
    data = request.get_json(silent=True) or {}
    fields = _clean_company_fields(data)

    # Company name is required.
    if not fields.get("name"):
        return jsonify(error="name is required"), 400

    cursor = get_db().cursor(dictionary=True)

    # Check if company already exists.
    cursor.execute(
        "SELECT id FROM companies WHERE name = %s",
        (fields["name"],),
    )

    if cursor.fetchone() is not None:
        return jsonify(error="a company with this name already exists"), 409

    cursor.execute(
        "INSERT INTO companies (name, description, industry, location, website)"
        " VALUES (%s, %s, %s, %s, %s)",
        (
            fields.get("name"),
            fields.get("description"),
            fields.get("industry"),
            fields.get("location"),
            fields.get("website"),
        ),
    )

    get_db().commit()

    return jsonify(id=cursor.lastrowid, message="company created"), 201

# Admin can edit any company.
# Owners can only edit their own company.
@bp.post("/companies/<int:company_id>/edit")
@role_required("admin", "company_owner")
def edit_company(company_id):
    cursor = get_db().cursor(dictionary=True)

    cursor.execute(
        "SELECT id, owner_id FROM companies WHERE id = %s",
        (company_id,),
    )

    company = cursor.fetchone()

    if company is None:
        return jsonify(error="company not found"), 404

    user = g.current_user

    # Stop owners from editing other companies.
    if user["role"] == "company_owner" and company["owner_id"] != user["id"]:
        return jsonify(error="you can only edit your own company"), 403

    fields = _clean_company_fields(request.get_json(silent=True) or {})

    if not fields:
        return jsonify(error="nothing to update"), 400

    if "name" in fields and not fields["name"]:
        return jsonify(error="name cannot be empty"), 400

    # Prevent duplicate company names.
    if fields.get("name"):
        cursor.execute(
            "SELECT id FROM companies WHERE name = %s AND id != %s",
            (fields["name"], company_id),
        )

        if cursor.fetchone() is not None:
            return jsonify(error="a company with this name already exists"), 409

    assignments = ", ".join(f"{field} = %s" for field in fields)

    cursor.execute(
        f"UPDATE companies SET {assignments} WHERE id = %s",
        list(fields.values()) + [company_id],
    )

    get_db().commit()

    return jsonify(id=company_id, message="company updated")

# Return all dashboard data for the company owner.
@bp.get("/me/company")
@role_required("company_owner")
def my_company():
    cursor = get_db().cursor(dictionary=True)

    cursor.execute(
        "SELECT id, name, description, industry, location, website, average_rating"
        " FROM companies WHERE owner_id = %s",
        (g.current_user["id"],),
    )

    company = cursor.fetchone()

    if company is None:
        return jsonify(error="no company is linked to your account yet"), 404

    company["average_rating"] = (
        float(company["average_rating"])
        if company["average_rating"] is not None
        else None
    )

    # Get internships.
    cursor.execute(
        "SELECT id, title, description, location, deadline, is_active"
        " FROM internships WHERE company_id = %s ORDER BY created_at DESC",
        (company["id"],),
    )

    internships = cursor.fetchall()

    for role in internships:
        role["deadline"] = role["deadline"].isoformat() if role["deadline"] else None
        role["is_active"] = bool(role["is_active"])

    # Get approved reviews.
    cursor.execute(
        "SELECT r.id, r.rating, r.comment, r.created_at, u.name AS reviewer_name"
        " FROM reviews r JOIN users u ON u.id = r.user_id"
        " WHERE r.company_id = %s AND r.status = 'approved'"
        " ORDER BY r.created_at DESC",
        (company["id"],),
    )

    reviews = cursor.fetchall()

    for review in reviews:
        review["rating"] = float(review["rating"])
        review["created_at"] = review["created_at"].isoformat()

        # Get the first reply if it exists.
        cursor.execute(
            "SELECT body, created_at FROM replies WHERE review_id = %s"
            " ORDER BY created_at ASC LIMIT 1",
            (review["id"],),
        )

        reply = cursor.fetchone()

        review["reply"] = (
            {
                "body": reply["body"],
                "created_at": reply["created_at"].isoformat(),
            }
            if reply
            else None
        )

    return jsonify(
        company=company,
        internships=internships,
        reviews=reviews,
    )


# Company owner posts a new internship.
@bp.post("/companies/<int:company_id>/internships")
@role_required("company_owner")
def post_internship(company_id):
    cursor = get_db().cursor(dictionary=True)

    cursor.execute(
        "SELECT id, owner_id FROM companies WHERE id = %s",
        (company_id,),
    )

    company = cursor.fetchone()

    if company is None:
        return jsonify(error="company not found"), 404

    if company["owner_id"] != g.current_user["id"]:
        return jsonify(error="you can only post internships for your own company"), 403

    data = request.get_json(silent=True) or {}

    title = (data.get("title") or "").strip()

    # Internship title is required.
    if not title:
        return jsonify(error="title is required"), 400

    deadline = (data.get("deadline") or "").strip() or None

    # Check if the deadline format is valid.
    if deadline:
        try:
            date.fromisoformat(deadline)
        except ValueError:
            return jsonify(
                error="deadline must be a date like 2026-09-01"
            ), 400

    cursor.execute(
        "INSERT INTO internships (company_id, title, description, location, deadline)"
        " VALUES (%s, %s, %s, %s, %s)",
        (
            company_id,
            title,
            (data.get("description") or "").strip() or None,
            (data.get("location") or "").strip() or None,
            deadline,
        ),
    )

    get_db().commit()

    return jsonify(id=cursor.lastrowid, message="internship posted"), 201

# Open or close an internship.
@bp.post("/internships/<int:internship_id>/toggle")
@role_required("company_owner")
def toggle_internship(internship_id):
    cursor = get_db().cursor(dictionary=True)

    cursor.execute(
        "SELECT i.id, i.is_active, c.owner_id FROM internships i"
        " JOIN companies c ON c.id = i.company_id WHERE i.id = %s",
        (internship_id,),
    )

    internship = cursor.fetchone()

    if internship is None:
        return jsonify(error="internship not found"), 404

    # Only the owner can change the internship status.
    if internship["owner_id"] != g.current_user["id"]:
        return jsonify(error="you can only manage your own internships"), 403

    new_state = not internship["is_active"]

    cursor.execute(
        "UPDATE internships SET is_active = %s WHERE id = %s",
        (new_state, internship_id),
    )

    get_db().commit()

    return jsonify(id=internship_id, is_active=new_state)
