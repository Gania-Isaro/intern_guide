import os
from flask import Blueprint, g, jsonify, request, current_app

from ..db import get_db
from ..utils.decorators import role_required
from ..utils.uploads import MAX_FILE_SIZE, is_allowed_file, safe_filename

bp = Blueprint("verification", __name__, url_prefix="/verification-proofs")

# endpoints: upload proof of placement, check proof status

def _upload_folder():
    upload_root = current_app.config.get("UPLOAD_ROOT") or os.getenv("UPLOAD_ROOT")
    if upload_root:
        return os.path.join(upload_root, "proofs")

    return os.path.abspath(os.path.join(current_app.root_path, "..", "uploads", "proofs"))

@bp.post("")
@role_required("student")
def upload_proof():
    user = g.current_user

    company_id = request.form.get("company_id", type=int)
    if company_id is None:
        return jsonify(error="company_id is required"), 400
    
    file = request.files.get("file")
    if file is None or file.filename == "":
        return jsonify(error="Choose a file to upload"), 400

    if not is_allowed_file(file.filename):
        return jsonify(error="File type not allowed"), 400
    
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    if file_size > MAX_FILE_SIZE:
        return jsonify(error="File size exceeds limit of 5MB"), 400

    cursor = get_db().cursor(dictionary=True)

    cursor.execute("SELECT id FROM companies WHERE id = %s", (company_id,))
    if cursor.fetchone() is None:
        return jsonify(error="company not found"), 404

    # Verification is per company, so a student can prove a placement at more
    # than one company. A rejected proof does not block trying again here, but
    # an approved or still-pending one for THIS company does.
    cursor.execute(
        "SELECT status FROM verification_proofs"
        " WHERE user_id = %s AND company_id = %s AND status IN ('pending', 'approved')",
        (user["id"], company_id),
    )
    existing = cursor.fetchone()
    if existing is not None:
        if existing["status"] == "approved":
            return jsonify(error="you are already verified at this company"), 409
        return jsonify(error="you already have a pending proof for this company"), 409
    
    folder = _upload_folder()
    os.makedirs(folder, exist_ok=True)
    stored_name = safe_filename(file.filename)
    file.save(os.path.join(folder, stored_name))

    cursor.execute(
        "INSERT INTO verification_proofs (user_id, company_id, file_path) VALUES (%s, %s, %s)", (user["id"], company_id, f"uploads/proofs/{stored_name}"),
    )
    get_db().commit()

    return (jsonify(
        status = "pending",
        message = "Your verification proof has been submitted and is pending review."
    ), 201)
