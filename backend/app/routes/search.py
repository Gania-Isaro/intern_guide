from flask import Blueprint, jsonify
from ..db import get_db

bp = Blueprint("search", __name__, url_prefix="/companies")

@bp.get("")
def list_companies():
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT id, name, industry, location, average_rating FROM companies ORDER BY name ASC"
    )
    companies = cursor.fetchall()
    for c in companies:
        c["average_rating"] = float(c["average_rating"]) if c["average_rating"] is not None else None
    return jsonify(results=companies)