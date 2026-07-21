from datetime import date

from flask import Blueprint, g, jsonify, request

from ..db import get_db
from ..utils.decorators import role_required

bp = Blueprint("manage", __name__)

# Fields that users are allowed to edit.
COMPANY_FIELDS = ("name", "description", "industry", "location", "website")


def _clean_company_fields(data):
    # Remove extra spaces and keep only allowed fields.
    cleaned = {}
    for field in COMPANY_FIELDS:
        if field in data:
            value = (data.get(field) or "").strip()
            cleaned[field] = value or None
    return cleaned

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