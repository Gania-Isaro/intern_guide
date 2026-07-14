from flask import Blueprint

bp = Blueprint("review", __name__, url_prefix="/reviews")

# endpoints: submit review, list approved reviews, my reviews
