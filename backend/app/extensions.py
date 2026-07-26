"""Shared Flask extensions, created here so routes can import them without a
circular import back to the app factory.

`limiter` is the rate limiter. It is created without an app and wired up in
create_app() via limiter.init_app(app). Individual routes add their own
stricter limits with @limiter.limit(...). The storage backend (in-memory for
local dev, Redis in production) is read from RATELIMIT_STORAGE_URI in config.
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# key requests by client IP. Behind nginx we add ProxyFix in create_app so this
# is the real visitor IP (from X-Forwarded-For), not nginx's 127.0.0.1.
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000 per hour", "120 per minute"],  # safety net for every route
    strategy="fixed-window",
)
