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