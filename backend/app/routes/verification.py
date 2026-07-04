from flask import Blueprint

bp = Blueprint("verification", __name__, url_prefix="/verification-proofs")

# endpoints: upload proof of placement, check proof status
