from flask import Blueprint

bp = Blueprint("auth", __name__, url_prefix="/auth")

# endpoints: register, login, logout, me
