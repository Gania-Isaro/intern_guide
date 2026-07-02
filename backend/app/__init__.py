from flask import Flask, jsonify

from .config import Config
from .routes import auth, moderation, rating, review, search, verification


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    @app.get("/health")
    def health():
        return jsonify(status="ok")

    for service in (auth, search, review, rating, verification, moderation):
        app.register_blueprint(service.bp)

    return app
