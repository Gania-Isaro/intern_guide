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
        