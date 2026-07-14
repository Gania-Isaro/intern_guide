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

@bp.get("")
def list_companies():
# Store filters and SQL parameters
    where = ["1=1"]
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
        f"SELECT {COMPANY_FIELDS}, c.website, c.description "
        "FROM companies c WHERE c.id = %s",
        (company_id,),
    )
    company = cursor.fetchone()

    # return error if company not found
    if company is None:
        return jsonify(error="Company not found"), 404
    company["average_rating"] = (float(company["average_rating"]) if company["average_rating"] is not None else None)   

# Get active internships for the company
    cursor.execute(
        "SELECT id, title, description, location, deadline, is_active"
        "FROM internships WHERE company_id = %s AND is_active = TRUE "
        "ORDER BY created_at DESC",
        (company_id,),
    )
    
    internships = cursor.fetchall()
    for role in internships:
        role["deadline"] = role["deadline"].isoformat() if role["deadline"] else None
        role["is_active"] = bool(role["is_active"])  # Convert to boolean for JSON response

    cursor .execute(
        "SELECT r.id, r.rating, r.mentorship, r.tasks, r.learning, r.environment, "
        "r.comment, r.created_at, u.name AS reviewer_name, "
        "u.is_verified AS reviewer_verified "
        "FROM reviews r JOIN users u ON u.id = r.user_id "
        "WHERE r.company_id = %s AND r.status = 'approved' "
        "ORDER BY r.created_at DESC",
        (company_id,),
    )
    reviews = cursor.fetchall()
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
    
    company["internships"] = internships
    company["reviews"] = reviews
    return jsonify(company)