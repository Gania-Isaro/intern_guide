# Numbers behind the charts on a company profile (G6).
#
# Everything here is worked out from reviews that an admin already approved,
# so a company cannot inflate its own graphs. The endpoint is public: anyone
# looking at a company profile can read it, logged in or not.

from flask import Blueprint, jsonify

from ..db import get_db

bp = Blueprint("stats", __name__)


# The three counters on the homepage. They must match what a visitor actually
# finds after clicking through, so everything counts only what is public:
# approved companies, approved reviews, and the industries those companies span.
@bp.get("/stats/summary")
def summary():
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(
        "SELECT"
        " (SELECT COUNT(*) FROM companies WHERE status = 'approved') AS companies,"
        " (SELECT COUNT(*) FROM reviews WHERE status = 'approved') AS reviews,"
        " (SELECT COUNT(DISTINCT industry) FROM companies"
        "   WHERE status = 'approved' AND industry IS NOT NULL AND industry <> '')"
        "   AS industries"
    )
    row = cursor.fetchone()
    return jsonify(
        companies=int(row["companies"]),
        reviews=int(row["reviews"]),
        industries=int(row["industries"]),
    )


# The gender split is only shown once enough people have answered. With two or
# three reviews a chart saying "one woman in 2025" points at a real person, and
# reviewers were promised their answer would only ever be shown added up.
MIN_GENDER_ANSWERS = 5


def _category_averages(cursor, company_id):
    """Average of each of the four scores. Feeds the radar chart."""
    cursor.execute(
        "SELECT AVG(mentorship) AS mentorship, AVG(tasks) AS tasks,"
        " AVG(learning) AS learning, AVG(environment) AS environment"
        " FROM reviews WHERE company_id = %s AND status = 'approved'",
        (company_id,),
    )
    row = cursor.fetchone()
    # every value is None when the company has no approved reviews yet
    return {name: round(float(value), 1) if value is not None else 0.0
            for name, value in row.items()}


def _star_distribution(cursor, company_id):
    """How many 1, 2, 3, 4 and 5 star reviews. Feeds the bar chart.

    Ratings are stored with one decimal (4.3), so we round each one to the
    nearest whole star before counting.
    """
    cursor.execute(
        "SELECT ROUND(rating) AS stars, COUNT(*) AS count"
        " FROM reviews WHERE company_id = %s AND status = 'approved'"
        " GROUP BY stars",
        (company_id,),
    )
    counted = {int(row["stars"]): row["count"] for row in cursor.fetchall()}
    # always return all five bars, so the chart keeps its shape
    return [{"stars": star, "count": counted.get(star, 0)} for star in range(1, 6)]


def _rating_trend(cursor, company_id):
    """Average rating per internship year. Feeds the line chart."""
    cursor.execute(
        "SELECT intern_year AS year, ROUND(AVG(rating), 1) AS average,"
        " COUNT(*) AS count"
        " FROM reviews"
        " WHERE company_id = %s AND status = 'approved' AND intern_year IS NOT NULL"
        " GROUP BY intern_year ORDER BY intern_year",
        (company_id,),
    )
    return [
        {"year": row["year"], "average": float(row["average"]), "count": row["count"]}
        for row in cursor.fetchall()
    ]


def _gender_by_year(cursor, company_id):
    """Who interned there each year, or None when too few people answered.

    'prefer_not_to_say' and blank answers are counted in the total that decides
    whether we show anything, but they never appear as their own bar.
    """
    cursor.execute(
        "SELECT COUNT(*) AS answered FROM reviews"
        " WHERE company_id = %s AND status = 'approved'"
        "   AND gender IS NOT NULL AND gender <> 'prefer_not_to_say'"
        "   AND intern_year IS NOT NULL",
        (company_id,),
    )
    if cursor.fetchone()["answered"] < MIN_GENDER_ANSWERS:
        return None

    cursor.execute(
        "SELECT intern_year AS year,"
        " SUM(gender = 'female') AS female,"
        " SUM(gender = 'male')   AS male,"
        " SUM(gender = 'other')  AS other"
        " FROM reviews"
        " WHERE company_id = %s AND status = 'approved'"
        "   AND gender IS NOT NULL AND gender <> 'prefer_not_to_say'"
        "   AND intern_year IS NOT NULL"
        " GROUP BY intern_year ORDER BY intern_year",
        (company_id,),
    )
    return [
        {
            "year": row["year"],
            "female": int(row["female"]),
            "male": int(row["male"]),
            "other": int(row["other"]),
        }
        for row in cursor.fetchall()
    ]


@bp.get("/companies/<int:company_id>/stats")
def company_stats(company_id):
    cursor = get_db().cursor(dictionary=True)

    # a company nobody has approved yet has no public profile, so no charts
    cursor.execute(
        "SELECT id FROM companies WHERE id = %s AND status = 'approved'",
        (company_id,),
    )
    if cursor.fetchone() is None:
        return jsonify(error="company not found"), 404

    cursor.execute(
        "SELECT COUNT(*) AS total FROM reviews"
        " WHERE company_id = %s AND status = 'approved'",
        (company_id,),
    )
    total = cursor.fetchone()["total"]

    # nothing to draw yet, but answer normally so the page can say so politely
    if total == 0:
        return jsonify(
            total_reviews=0,
            categories=_category_averages(cursor, company_id),
            distribution=_star_distribution(cursor, company_id),
            trend=[],
            gender_by_year=None,
        )

    return jsonify(
        total_reviews=total,
        categories=_category_averages(cursor, company_id),
        distribution=_star_distribution(cursor, company_id),
        trend=_rating_trend(cursor, company_id),
        gender_by_year=_gender_by_year(cursor, company_id),
    )
