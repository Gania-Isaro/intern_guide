def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.get_json()["status"] == "ok"


def test_register_requires_all_fields(client):
    res = client.post("/auth/register", json={})
    assert res.status_code == 400


def test_register_rejects_invalid_email(client):
    res = client.post(
        "/auth/register",
        json={"name": "Test User", "email": "not-an-email", "password": "longenough1"},
    )
    assert res.status_code == 400


def test_register_rejects_short_password(client):
    res = client.post(
        "/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "short"},
    )
    assert res.status_code == 400


def test_register_rejects_admin_role(client):
    # admin accounts are created by hand, nobody registers as one
    res = client.post(
        "/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "longenough1",
            "role": "admin",
        },
    )
    assert res.status_code == 400


def test_login_requires_credentials(client):
    res = client.post("/auth/login", json={})
    assert res.status_code == 400
