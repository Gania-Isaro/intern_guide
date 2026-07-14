import os
from flask import Blueprint, g, jsonify, request, current_app

from ..db import get_db
from ..utils.decorators import role_required
from ..utils.uploads import MAX_FILE_SIZE, is_allowed_file, safe_filename

bp = Blueprint("verification", __name__, url_prefix="/verification-proofs")

# endpoints: upload proof of placement, check proof status

def _upload_folder():
    return os.path.join(current_app.root_path, "..", "uploads", "proofs")

@bp.post("")
@role_required("student")
def upload_proof():
    user = g.current_user

    if user["is_verified"]:
        return jsonify(error="account already verified"), 400
    
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
    
