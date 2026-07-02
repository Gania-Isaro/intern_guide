from flask import Blueprint

bp = Blueprint("search", __name__, url_prefix="/companies")

# endpoints: list companies, company detail, search + filters
