def test_review_queue_needs_a_login(client):
    assert client.get("/admin/reviews").status_code == 401


def test_proof_queue_needs_a_login(client):
    assert client.get("/admin/proofs").status_code == 401


def test_review_decisions_need_a_login(client):
    assert client.post("/admin/reviews/1/approve").status_code == 401
    assert client.post("/admin/reviews/1/reject").status_code == 401


def test_proof_decisions_need_a_login(client):
    assert client.post("/admin/proofs/1/approve").status_code == 401
    assert client.post("/admin/proofs/1/reject").status_code == 401
