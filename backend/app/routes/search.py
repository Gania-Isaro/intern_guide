from math import ceil
from flask import Blueprint, jsonify, request
from ..db import get_db

bp = Blueprint("search", __name__, url_prefix="/companies")

# Sorting options for company results
SORTS = {
    "rating": "c.average_rating IS NULL, c.average_rating DESC, c.name ASC",
    "reviews": "review_count DESC, c.name ASC",
    "name": "c.name ASC",
    "newest": "c.created_at DESC",
}

# Fields returned for each company, including review statistics
COMPANY_FIELDS = """
    c.id, c.name, c.industry, c.location, c.average_rating,
    (SELECT COUNT(*) FROM reviews r
      WHERE r.company_id = c.id AND r.status = 'approved') AS review_count,
    (SELECT COUNT(*) FROM reviews r JOIN users u ON u.id = r.user_id
      WHERE r.company_id = c.id AND r.status = 'approved'
        AND u.is_verified = TRUE) AS verified_count
"""

# validatingg  and limit integer query parameters
def _int_arg(name, default, minimum, maximum=None):
    try:
        value = int(request.args.get(name, default))
    except (TypeError, ValueError):
        value = default
    value = max(minimum, value)
    if maximum is not None:
        value = min(maximum, value)
    return value


# The filter values a student may send. Anything outside these lists is thrown
# away instead of reaching the query, so a hand-typed URL cannot break search.
ALLOWED_FILTERS = {
    "compensation": ("paid", "stipend", "unpaid", "academic_credit", "intern_pays"),
    "work_mode": ("onsite", "hybrid", "remote"),
    "schedule": ("full_time", "part_time", "flexible"),
}


def _list_arg(name, allowed=None):
    """Read a repeated filter sent as one comma separated value.

    "?work_mode=remote,hybrid" becomes ["remote", "hybrid"].
    """
    raw = request.args.get(name)
    if not raw:
        return []
    values = [piece.strip() for piece in raw.split(",") if piece.strip()]
    if allowed is not None:
        values = [value for value in values if value in allowed]
    return values

@bp.get("")
def list_companies():
# Store filters and SQL parameters
    # a business an owner registered is invisible until an admin approves it
    where = ["c.status = 'approved'"]
    params = []

    # Filter companies by search search name 
    search = request.args.get("search")
    if search:
        where.append("c.name LIKE %s")
        params.append(f"%{search}%")

    # Filter companies by industry
    industry = request.args.get("industry")
    if industry:
        where.append("c.industry = %s")
        params.append(industry)

    # Filter companies by location
    location = request.args.get("location")
    if location:
        where.append("c.location = %s")
        params.append(location)


    # Only show companies rated at least this well
    min_rating = request.args.get("min_rating", type=float)
    if min_rating is not None:
        where.append("c.average_rating >= %s")
        params.append(min_rating)

    # Perks are on the company. Asking for two perks means the company must
    # offer both, which is what a student ticking two boxes expects.
    for amenity in _list_arg("amenity"):
        where.append(
            "EXISTS (SELECT 1 FROM company_amenities a"
            " WHERE a.company_id = c.id AND a.amenity = %s)"
        )
        params.append(amenity)

    # Pay, place and hours live on the internships. A company matches when it
    # has at least one open posting that fits everything the student asked for,
    # so the same posting has to satisfy all of these conditions at once.
    posting_where = ["i.company_id = c.id", "i.is_active = TRUE"]
    posting_params = []

    for name, allowed in ALLOWED_FILTERS.items():
        chosen = _list_arg(name, allowed)
        if chosen:
            placeholders = ", ".join(["%s"] * len(chosen))
            posting_where.append(f"i.{name} IN ({placeholders})")
            posting_params.extend(chosen)

    fields = _list_arg("field")
    if fields:
        placeholders = ", ".join(["%s"] * len(fields))
        posting_where.append(f"i.field IN ({placeholders})")
        posting_params.extend(fields)

    # only add the subquery when something was actually asked for
    if len(posting_where) > 2:
        where.append(
            "EXISTS (SELECT 1 FROM internships i WHERE " + " AND ".join(posting_where) + ")"
        )
        params.extend(posting_params)

    # Get sorting and pagination  values
    sort = request.args.get("sort", "rating")
    if sort not in SORTS:
        sort = "rating" 
    page = _int_arg("page", default=1, minimum=1)
    per_page = _int_arg("per_page", default=12, minimum=1, maximum=50)

    where_sql = " AND ".join(where)
    cursor = get_db().cursor(dictionary=True)

# Counting total companies for pagination
    cursor.execute(f"SELECT COUNT(*) AS total FROM companies c WHERE {where_sql}", params)
    total = cursor.fetchone()["total"]
    total_pages = ceil(total / per_page) if total else 0    

# Get companies for the current  page
    cursor.execute(
        f"SELECT {COMPANY_FIELDS} FROM companies c WHERE {where_sql} "
        f"ORDER BY {SORTS[sort]} LIMIT %s OFFSET %s",
        params + [per_page, (page - 1) * per_page],
    )
    companies = cursor.fetchall()

    # Convert ratings to numbers for JSON response
    for c in companies:
        c["average_rating"] = float(c["average_rating"]) if c["average_rating"] is not None else None   

    return jsonify(
        companies=companies,
        page=page,
        per_page=per_page,
        total=total,
        total_pages=total_pages,
        sort=sort,
    )

@bp.get("/<int:company_id>")
def get_company(company_id):
    cursor = get_db().cursor(dictionary=True)

    # get company details
    cursor.execute(
        f"SELECT {COMPANY_FIELDS}, c.website, c.description, c.google_address,"
        " c.size, c.founded_year "
        "FROM companies c WHERE c.id = %s AND c.status = 'approved'",
        (company_id,),
    )
    company = cursor.fetchone()

    # a pending or rejected business has no public profile, so it reads as
    # missing here rather than telling a stranger that it exists
    if company is None:
        return jsonify(error="company not found"), 404

    # the perks shown as tags on the profile
    cursor.execute(
        "SELECT amenity FROM company_amenities WHERE company_id = %s",
        (company_id,),
    )
    company["amenities"] = [row["amenity"] for row in cursor.fetchall()]
    company["average_rating"] = (float(company["average_rating"]) if company["average_rating"] is not None else None)   

# Get active internships for the company
    cursor.execute(
        "SELECT id, title, description, location, deadline, is_active, "
        "compensation, stipend_amount, stipend_currency, stipend_period, "
        "work_mode, schedule, duration_months, start_date, openings, field "
        "FROM internships WHERE company_id = %s AND is_active = TRUE "
        "ORDER BY created_at DESC",
        (company_id,),
    )

    internships = cursor.fetchall()

    # formatting internship dates and status values
    for role in internships:
        role["deadline"] = role["deadline"].isoformat() if role["deadline"] else None
        role["start_date"] = (
            role["start_date"].isoformat() if role["start_date"] else None
        )
        role["is_active"] = bool(role["is_active"])  # Convert to boolean for JSON response
        role["stipend_amount"] = (
            float(role["stipend_amount"]) if role["stipend_amount"] is not None else None
        )

    #Get approved reviews for reviewr information 
    cursor.execute(
        "SELECT r.id, r.rating, r.mentorship, r.tasks, r.learning, r.environment, "
        "r.comment, r.created_at, u.name AS reviewer_name, "
        "u.is_verified AS reviewer_verified "
        "FROM reviews r JOIN users u ON u.id = r.user_id "
        "WHERE r.company_id = %s AND r.status = 'approved' "
        "ORDER BY r.created_at DESC",
        (company_id,),
    )
    reviews = cursor.fetchall()

    #Format review data and add company replies
    for review in reviews:
        review["rating"] = float(review["rating"])
        review["reviewer_verified"] = bool(review["reviewer_verified"])  # Convert to boolean for JSON response
        review["created_at"] = review["created_at"].isoformat()  # Convert to ISO format for JSON response
        cursor.execute(
            "SELECT body, created_at FROM replies WHERE review_id = %s "
            "ORDER BY created_at ASC LIMIT 1",
            (review["id"],),
        )
        reply = cursor.fetchone()
        review["reply"] = (
            {"body": reply["body"], "created_at": reply["created_at"].isoformat()}
            if reply
            else None
        )
    
    # ADd internships and reviews to company response
    company["internships"] = internships
    company["reviews"] = reviews
    return jsonify(company)