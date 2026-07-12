from flask import Blueprint, jsonify, request
from ..db import get_db

bp = Blueprint("search", __name__, url_prefix="/companies")

@bp.get("")
def list_companies():
    cursor = get_db().cursor(dictionary=True)
    query = "SELECT id, name, industry, location, average_rating FROM companies WHERE 1=1"
    params = []

    search = request.args.get("search")
    if search:
        query += " AND name LIKE %s"
        params.append(f"%{search}%")
    industry = request.args.get("industry")
    if industry:
        query += " AND industry = %s"
        params.append(industry)
    location = request.args.get("location")
    if location:
        query += " AND location = %s"
        params.append(location) 

    query += " ORDER BY name ASC"
    cursor.execute(query, params)
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