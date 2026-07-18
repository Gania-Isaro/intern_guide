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
    """A cleaned, unique name we can safely write to disk. ..."""
    cleaned = re.sub(r"[^A-Za-z0-9._-]", "_", filename)
    cleaned = cleaned.lstrip(".")  # no hidden files, no sneaky '..' starts
    # keep only the END of long names (max 80 chars) so the extension survives
    cleaned = cleaned[-80:] or "file"
    return f"{uuid.uuid4().hex}_{cleaned}"
