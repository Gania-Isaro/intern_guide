import pytest

from app import create_app
from app.extensions import limiter


@pytest.fixture()
def app():
    app = create_app()
    app.config.update(TESTING=True)
    limiter.enabled = False  # don't rate-limit during tests
    return app


@pytest.fixture()
def client(app):
    return app.test_client()
