# Sprint 3 backend tests (G1).
#
# Same style as test_auth.py: hit the real endpoints with Flask's test
# client for the checks that don't need a database (login walls, missing
# parameters), and test the pure helper functions directly.

from app.services.rating import compute_overall
from app.utils.uploads import MAX_FILE_SIZE, is_allowed_file, safe_filename


# ---------- the endpoints protect themselves ----------

def test_create_review_requires_login(client):
    res = client.post("/reviews", json={"company_id": 1})
    assert res.status_code == 401


def test_upload_proof_requires_login(client):
    res = client.post("/verification-proofs", data={"company_id": "1"})
    assert res.status_code == 401


def test_my_reviews_requires_login(client):
    res = client.get("/me/reviews")
    assert res.status_code == 401


def test_list_reviews_requires_company_id(client):
    # no company_id in the query string -> 400 before touching anything
    res = client.get("/reviews")
    assert res.status_code == 400


# ---------- the rating engine does honest math ----------

def test_overall_is_the_average_of_the_four_scores():
    scores = {"mentorship": 5, "tasks": 4, "learning": 4, "environment": 4}
    assert compute_overall(scores) == 4.3  # 17 / 4 = 4.25, rounded to 4.3


def test_overall_of_equal_scores_is_that_score():
    scores = {"mentorship": 3, "tasks": 3, "learning": 3, "environment": 3}
    assert compute_overall(scores) == 3.0


def test_overall_stays_between_1_and_5():
    lowest = {"mentorship": 1, "tasks": 1, "learning": 1, "environment": 1}
    highest = {"mentorship": 5, "tasks": 5, "learning": 5, "environment": 5}
    assert compute_overall(lowest) == 1.0
    assert compute_overall(highest) == 5.0


# ---------- upload validation keeps bad files out ----------

def test_allowed_file_types():
    assert is_allowed_file("certificate.pdf")
    assert is_allowed_file("offer_letter.PNG")  # case must not matter
    assert is_allowed_file("photo.jpg")
    assert not is_allowed_file("virus.exe")
    assert not is_allowed_file("script.pdf.sh")  # the LAST extension decides
    assert not is_allowed_file("no_extension")


def test_safe_filename_removes_dangerous_characters():
    name = safe_filename("../../etc/passwd.pdf")
    assert "/" not in name
    assert not name.startswith(".")
    assert name.endswith(".pdf")


def test_safe_filename_is_unique_every_time():
    # two students uploading 'certificate.pdf' must never overwrite each other
    assert safe_filename("certificate.pdf") != safe_filename("certificate.pdf")


def test_max_file_size_is_5_mb():
    assert MAX_FILE_SIZE == 5 * 1024 * 1024