from flask import Blueprint

bp = Blueprint("rating", __name__, url_prefix="/ratings")

# recomputes a company's average rating when reviews change
