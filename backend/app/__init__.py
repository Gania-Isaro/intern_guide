from flask import Flask, jsonify
from flask_cors import CORS

from .config import Config
from .db import close_db
from .routes import auth, manage, moderation, rating, review, search, verification


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.teardown_appcontext(close_db)

    # credentials on, so the auth cookie travels with frontend requests
    CORS(app, origins=[app.config["FRONTEND_ORIGIN"]], supports_credentials=True)

    @app.get("/health")
    def health():
        return jsonify(status="ok")

    for service in (auth, manage, search, review, rating, verification, moderation):
        app.register_blueprint(service.bp)

    return app
