import os

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from werkzeug.middleware.proxy_fix import ProxyFix

from .config import Config
from .db import close_db
from .extensions import limiter
from .security import apply_security_headers
from .routes import auth, manage, moderation, rating, review, search, stats, verification


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Trust the nginx reverse proxy: this makes request.remote_addr (and so the
    # rate-limit key) the real visitor IP from X-Forwarded-For, not 127.0.0.1.
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

    app.teardown_appcontext(close_db)

    # credentials on, so the auth cookie travels with frontend requests
    CORS(app, origins=[app.config["FRONTEND_ORIGIN"]], supports_credentials=True)

    # rate limiting + browser security headers on every response
    limiter.init_app(app)
    apply_security_headers(app)

    # a browser's CORS pre-flight (OPTIONS) must never be rate limited
    @limiter.request_filter
    def _skip_preflight():
        return request.method == "OPTIONS"

    # when a limit is hit, answer with JSON like the rest of the API
    @app.errorhandler(429)
    def _too_many(_e):
        return jsonify(error="too many requests, please slow down and try again"), 429

    @app.get("/health")
    @limiter.exempt
    def health():
        return jsonify(status="ok")

    # ---- API documentation: Swagger UI at /docs, OpenAPI spec at /openapi.yaml ----
    @app.get("/openapi.yaml")
    @limiter.exempt
    def openapi_spec():
        return send_file(
            os.path.join(app.root_path, "openapi.yaml"), mimetype="application/yaml"
        )

    swagger_ui = get_swaggerui_blueprint(
        "/docs", "/openapi.yaml", config={"app_name": "InternGuide API"}
    )
    app.register_blueprint(swagger_ui, url_prefix="/docs")

    for service in (auth, manage, search, review, rating, verification, moderation, stats):
        app.register_blueprint(service.bp)

    return app
