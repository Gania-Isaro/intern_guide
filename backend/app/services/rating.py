from decimal import ROUND_HALF_UP, Decimal

from ..db import get_db

def compute_overall(scores):

    total = scores["mentorship"] + scores["tasks"] + scores["learning"] + scores["environment"]
    average = Decimal(total) / 4
    return float(average.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))