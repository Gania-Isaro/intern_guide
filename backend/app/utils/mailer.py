import smtplib
from email.message import EmailMessage

from flask import current_app

# A tiny wrapper around Python's built-in smtplib. It reads the SMTP settings
# from config (which come from .env) and sends one plain-text email. Any SMTP
# service that speaks STARTTLS on a port like 587 works - Brevo, Mailtrap,
# Gmail, and so on - so there is nothing provider-specific here.


def send_email(to_address, subject, body):
    host = current_app.config["SMTP_HOST"]
    if not host:
        # SMTP not set up yet: make the reason obvious in the server log.
        raise RuntimeError("SMTP_HOST is empty - fill the SMTP_* values in .env")

    from_name = current_app.config["SMTP_FROM_NAME"] or "InternGuide"
    from_address = current_app.config["SMTP_FROM"] or current_app.config["SMTP_USER"]

    message = EmailMessage()
    message["From"] = f"{from_name} <{from_address}>"
    message["To"] = to_address
    message["Subject"] = subject
    message.set_content(body)

    port = current_app.config["SMTP_PORT"]
    with smtplib.SMTP(host, port, timeout=15) as server:
        server.starttls()  # upgrade the connection to encrypted
        user = current_app.config["SMTP_USER"]
        if user:
            server.login(user, current_app.config["SMTP_PASS"])
        server.send_message(message)
