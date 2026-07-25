from datetime import date

from flask import Blueprint, g, jsonify, request

from ..db import get_db
from ..utils.decorators import role_required
from .moderation import _delete_proof_file

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

def _save_amenities(cursor, company_id, chosen):
    """Replace the company's perks with the ones ticked on the form.

    Anything not in AMENITIES is dropped rather than rejected, so a stale
    browser tab can never break someone's save.
    """
    cursor.execute("DELETE FROM company_amenities WHERE company_id = %s", (company_id,))
    wanted = [name for name in AMENITIES if name in set(chosen)]
    for name in wanted:
        cursor.execute(
            "INSERT INTO company_amenities (company_id, amenity) VALUES (%s, %s)",
            (company_id, name),
        )


def _amenities_of(cursor, company_id):
    cursor.execute(
        "SELECT amenity FROM company_amenities WHERE company_id = %s",
        (company_id,),
    )
    return [row["amenity"] for row in cursor.fetchall()]


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

    problem = _field_problem(fields)
    if problem:
        return jsonify(error=problem), 400

    # An admin adding a company is the check, so it goes live immediately.
    cursor.execute(
        "INSERT INTO companies"
        " (name, description, industry, location, website, google_address,"
        "  size, founded_year, status)"
        " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'approved')",
        (
            fields.get("name"),
            fields.get("description"),
            fields.get("industry"),
            fields.get("location"),
            fields.get("website"),
            fields.get("google_address"),
            fields.get("size"),
            fields.get("founded_year"),
        ),
    )
    company_id = cursor.lastrowid
    _save_amenities(cursor, company_id, data.get("amenities") or [])

    get_db().commit()

    return jsonify(id=company_id, message="company created"), 201

# ---------- owners register their own business (H1) ----------

# An owner fills this in themselves. The company is saved as 'pending' and
# stays out of search until an admin approves it, so nobody can put a made-up
# employer on the site and start collecting reviews for it.
@bp.post("/companies/register")
@role_required("company_owner")
def register_company():
    data = request.get_json(silent=True) or {}
    fields = _clean_company_fields(data)

    if not fields.get("name"):
        return jsonify(error="name is required"), 400

    problem = _field_problem(fields)
    if problem:
        return jsonify(error=problem), 400

    cursor = get_db().cursor(dictionary=True)

    # one business per owner account, which keeps /me/company unambiguous
    cursor.execute(
        "SELECT id FROM companies WHERE owner_id = %s", (g.current_user["id"],)
    )
    if cursor.fetchone() is not None:
        return jsonify(error="your account already has a company"), 409

    cursor.execute("SELECT id FROM companies WHERE name = %s", (fields["name"],))
    if cursor.fetchone() is not None:
        return jsonify(error="a company with this name already exists"), 409

    cursor.execute(
        "INSERT INTO companies"
        " (owner_id, name, description, industry, location, website,"
        "  google_address, size, founded_year, status)"
        " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')",
        (
            g.current_user["id"],
            fields.get("name"),
            fields.get("description"),
            fields.get("industry"),
            fields.get("location"),
            fields.get("website"),
            fields.get("google_address"),
            fields.get("size"),
            fields.get("founded_year"),
        ),
    )
    company_id = cursor.lastrowid
    _save_amenities(cursor, company_id, data.get("amenities") or [])

    get_db().commit()

    return (
        jsonify(
            id=company_id,
            status="pending",
            message="thanks - an admin will check your business before it goes live",
        ),
        201,
    )

# ---------- the admin decides on registered businesses (H2) ----------

@bp.get("/admin/companies")
@role_required("admin")
def pending_companies():
    """Businesses waiting for a decision, oldest first."""
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT c.id, c.name, c.description, c.industry, c.location, c.website,"
        " c.google_address, c.size, c.founded_year, c.created_at,"
        " u.name AS owner_name, u.email AS owner_email"
        " FROM companies c JOIN users u ON u.id = c.owner_id"
        " WHERE c.status = 'pending' ORDER BY c.created_at ASC"
    )
    companies = cursor.fetchall()
    for company in companies:
        company["created_at"] = company["created_at"].isoformat()
        company["amenities"] = _amenities_of(cursor, company["id"])
    return jsonify(companies=companies, total=len(companies))


@bp.get("/admin/companies/all")
@role_required("admin")
def all_companies():
    """Every company with its status, so the admin can see hidden ones too.

    The public list at GET /companies deliberately hides anything that is not
    approved, which is exactly what an admin needs to be able to see.
    """
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT c.id, c.name, c.industry, c.location, c.website, c.description,"
        " c.status, c.average_rating, u.name AS owner_name"
        " FROM companies c LEFT JOIN users u ON u.id = c.owner_id"
        " ORDER BY c.name ASC"
    )
    companies = cursor.fetchall()
    for company in companies:
        company["average_rating"] = (
            float(company["average_rating"])
            if company["average_rating"] is not None
            else None
        )
    return jsonify(companies=companies, total=len(companies))


@bp.get("/admin/companies/<int:company_id>")
@role_required("admin")
def one_company(company_id):
    """One company, whatever its status, for the admin edit form."""
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT id, name, description, industry, location, website,"
        " google_address, size, founded_year, status"
        " FROM companies WHERE id = %s",
        (company_id,),
    )
    company = cursor.fetchone()
    if company is None:
        return jsonify(error="company not found"), 404

    company["amenities"] = _amenities_of(cursor, company_id)
    return jsonify(company=company)


def _decide_company(company_id, new_status):
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT id FROM companies WHERE id = %s AND status = 'pending'",
        (company_id,),
    )
    if cursor.fetchone() is None:
        return jsonify(error="pending company not found"), 404

    cursor.execute(
        "UPDATE companies SET status = %s WHERE id = %s", (new_status, company_id)
    )
    get_db().commit()
    return jsonify(id=company_id, status=new_status)


@bp.post("/admin/companies/<int:company_id>/approve")
@role_required("admin")
def approve_company(company_id):
    return _decide_company(company_id, "approved")


@bp.post("/admin/companies/<int:company_id>/reject")
@role_required("admin")
def reject_company(company_id):
    return _decide_company(company_id, "rejected")


# ---------- switching a company off and on again, and deleting it ----------
#
# Approve/reject above only answer a brand new registration. These two work on
# any company, so an admin can take a live company off the site without losing
# its reviews, and put it back later.

def _set_company_status(company_id, new_status):
    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT id FROM companies WHERE id = %s", (company_id,))
    if cursor.fetchone() is None:
        return jsonify(error="company not found"), 404

    cursor.execute(
        "UPDATE companies SET status = %s WHERE id = %s", (new_status, company_id)
    )
    get_db().commit()
    return jsonify(id=company_id, status=new_status)


@bp.post("/admin/companies/<int:company_id>/deactivate")
@role_required("admin")
def deactivate_company(company_id):
    """Hide the company from students. Nothing is deleted."""
    return _set_company_status(company_id, "rejected")


@bp.post("/admin/companies/<int:company_id>/activate")
@role_required("admin")
def activate_company(company_id):
    """Put a hidden company back on the site."""
    return _set_company_status(company_id, "approved")


@bp.delete("/admin/companies/<int:company_id>")
@role_required("admin")
def delete_company(company_id):
    """Delete a company for good.

    The database is set up to cascade, so the internships, reviews, replies,
    perks and proof records go with it. Proof files live on disk rather than in
    the database, so those are removed here by hand.
    """
    cursor = get_db().cursor(dictionary=True)
    cursor.execute("SELECT id, name FROM companies WHERE id = %s", (company_id,))
    company = cursor.fetchone()
    if company is None:
        return jsonify(error="company not found"), 404

    cursor.execute(
        "SELECT file_path FROM verification_proofs WHERE company_id = %s",
        (company_id,),
    )
    for proof in cursor.fetchall():
        _delete_proof_file(proof["file_path"])

    cursor.execute("DELETE FROM companies WHERE id = %s", (company_id,))
    get_db().commit()

    return jsonify(id=company_id, message=f"{company['name']} was deleted")

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

    data = request.get_json(silent=True) or {}
    fields = _clean_company_fields(data)

    if not fields and "amenities" not in data:
        return jsonify(error="nothing to update"), 400

    if "name" in fields and not fields["name"]:
        return jsonify(error="name cannot be empty"), 400

    problem = _field_problem(fields)
    if problem:
        return jsonify(error=problem), 400

    # Prevent duplicate company names.
    if fields.get("name"):
        cursor.execute(
            "SELECT id FROM companies WHERE name = %s AND id != %s",
            (fields["name"], company_id),
        )

        if cursor.fetchone() is not None:
            return jsonify(error="a company with this name already exists"), 409

    if fields:
        assignments = ", ".join(f"{field} = %s" for field in fields)

        cursor.execute(
            f"UPDATE companies SET {assignments} WHERE id = %s",
            list(fields.values()) + [company_id],
        )

    # only touch the perks when the form actually sent them, so an edit that
    # leaves the tick boxes out does not silently wipe them
    if "amenities" in data:
        _save_amenities(cursor, company_id, data.get("amenities") or [])

    get_db().commit()

    return jsonify(id=company_id, message="company updated")

# Return all dashboard data for the company owner.
@bp.get("/me/company")
@role_required("company_owner")
def my_company():
    cursor = get_db().cursor(dictionary=True)

    cursor.execute(
        "SELECT id, name, description, industry, location, website, google_address,"
        " size, founded_year, status, average_rating"
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
    company["amenities"] = _amenities_of(cursor, company["id"])

    # Get internships.
    cursor.execute(
        "SELECT id, title, description, location, deadline, is_active,"
        " compensation, stipend_amount, stipend_currency, stipend_period,"
        " work_mode, schedule, duration_months, start_date, openings, field"
        " FROM internships WHERE company_id = %s ORDER BY created_at DESC",
        (company["id"],),
    )

    internships = cursor.fetchall()

    for role in internships:
        role["deadline"] = role["deadline"].isoformat() if role["deadline"] else None
        role["start_date"] = (
            role["start_date"].isoformat() if role["start_date"] else None
        )
        role["is_active"] = bool(role["is_active"])
        role["stipend_amount"] = (
            float(role["stipend_amount"]) if role["stipend_amount"] is not None else None
        )

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

    # These four decide whether a student even sees the posting in the filters,
    # so an unrecognised value falls back to the safest honest default rather
    # than being silently stored.
    compensation = (data.get("compensation") or "unpaid").strip()
    if compensation not in COMPENSATION_TYPES:
        return jsonify(
            error="compensation must be one of: " + ", ".join(COMPENSATION_TYPES)
        ), 400

    work_mode = (data.get("work_mode") or "onsite").strip()
    if work_mode not in WORK_MODES:
        return jsonify(error="work mode must be one of: " + ", ".join(WORK_MODES)), 400

    schedule = (data.get("schedule") or "full_time").strip()
    if schedule not in SCHEDULES:
        return jsonify(error="schedule must be one of: " + ", ".join(SCHEDULES)), 400

    stipend_period = (data.get("stipend_period") or "").strip() or None
    if stipend_period and stipend_period not in STIPEND_PERIODS:
        return jsonify(
            error="stipend period must be one of: " + ", ".join(STIPEND_PERIODS)
        ), 400

    start_date = (data.get("start_date") or "").strip() or None
    if start_date:
        try:
            date.fromisoformat(start_date)
        except ValueError:
            return jsonify(error="start date must be a date like 2026-09-01"), 400


    cursor.execute(
        "INSERT INTO internships"
        " (company_id, title, description, location, deadline, compensation,"
        "  stipend_amount, stipend_period, work_mode, schedule, duration_months,"
        "  start_date, openings, field)"
        " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (
            company_id,
            title,
            (data.get("description") or "").strip() or None,
            (data.get("location") or "").strip() or None,
            deadline,
            compensation,
            _positive_number(data.get("stipend_amount")),
            stipend_period,
            work_mode,
            schedule,
            _positive_number(data.get("duration_months")),
            start_date,
            _positive_number(data.get("openings")) or 1,
            (data.get("field") or "").strip() or None,
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
