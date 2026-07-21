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