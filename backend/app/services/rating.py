from decimal import ROUND_HALF_UP, Decimal

from ..db import get_db

def compute_overall(scores):

    total = scores["mentorship"] + scores["tasks"] + scores["learning"] + scores["environment"]
    average = Decimal(total) / 4
    return float(average.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))

def recompute_company_average(company_id):

    cursor = get_db().cursor()
    cursor.execute(
        "UPDATE companies SET average_rating = ("
        " SELECT ROUND(AVG(rating), 1) FROM reviews"
        " WHERE company_id = %s AND status = 'approved'"
        ") WHERE id = %s",
        (company_id, company_id)
    )
    get_db().commit()