import re
import uuid

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024  


def file_extension(filename):
    if "." not in filename:
        return ""
    return filename.rsplit(".", 1)[1].lower()

def is_allowed_file(filename):
    return file_extension(filename) in ALLOWED_EXTENSIONS

def safe_filename(filename):
    cleaned = re.sub(r"[^A-Za-z0-9._-]", "_", filename)
    cleaned = cleaned.lstrip(".")  # no hidden files, no sneaky '..' starts
    return f"{uuid.uuid4().hex}_{cleaned}"