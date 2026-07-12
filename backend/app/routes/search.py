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

@bp.get("/<int:company_id>")
def get_company(company_id):
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT id, name, industry, location, website, description, average_rating "
        "FROM companies WHERE id = %s",
        (company_id,),
    )
    company = cursor.fetchone()
    if company is None:
        return jsonify(error="company not found"), 404
    company["average_rating"] = float(company["average_rating"]) if company["average_rating"] is not None else None
    return jsonify(company)