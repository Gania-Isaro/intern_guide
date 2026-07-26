"""Security response headers, applied to every API response.

These are the standard browser-hardening headers. The API returns JSON (and, at
/docs, the Swagger UI), so the Content-Security-Policy here only blocks framing;
the strong, page-level CSP lives on the frontend (Next.js). Setting these on the
backend too means a scan of api.gania.tech also comes back clean.
"""

# Two years, and cover subdomains. Safe because everything is served over HTTPS.
_HSTS = "max-age=63072000; includeSubDomains"

_HEADERS = {
    "Strict-Transport-Security": _HSTS,
    "X-Content-Type-Options": "nosniff",      # don't let the browser guess content types
    "X-Frame-Options": "DENY",                # never allow this API in an <iframe>
    "Referrer-Policy": "no-referrer",         # don't leak the URL to other sites
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Content-Security-Policy": "frame-ancestors 'none'",  # belt-and-braces anti-framing
    "Cross-Origin-Opener-Policy": "same-origin",
}


def apply_security_headers(app):
    @app.after_request
    def _set_headers(response):
        for name, value in _HEADERS.items():
            response.headers.setdefault(name, value)
        return response

    return app
