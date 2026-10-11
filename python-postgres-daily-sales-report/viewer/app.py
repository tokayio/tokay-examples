import os
import time
import uuid
from datetime import date, timedelta

import psycopg
from flask import Flask, abort, render_template
from psycopg.rows import dict_row

app = Flask(__name__)

ITEMS = [
    ("Stoneware mug", 2800),
    ("Linen tea towel", 1900),
    ("Olive wood spoon", 1600),
    ("Pour over set", 5200),
    ("Pantry labels", 1200),
    ("Market tote", 3400),
]


def connect():
    return psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row)


def seed_orders():
    today = date.today()
    rows = []
    for days_ago in range(1, 91):
        day = today - timedelta(days=days_ago)
        order_total = 2 + ((day.toordinal() * 7) % 5)
        if day.weekday() in (4, 5):
            order_total += 2
        for index in range(order_total):
            item, price = ITEMS[(day.toordinal() + index * 3) % len(ITEMS)]
            quantity = 1 + ((day.toordinal() + index) % 3 == 0)
            rows.append((str(uuid.uuid5(uuid.NAMESPACE_URL, f"sales:{day}:{index}")), day, item, quantity, price))
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.executemany(
                """
                INSERT INTO orders (id, ordered_on, item, quantity, unit_price_cents)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                rows,
            )


def seed_with_retry():
    for attempt in range(8):
        try:
            seed_orders()
            return
        except psycopg.Error:
            if attempt == 7:
                raise
            time.sleep(min(2 ** attempt, 8))


@app.get("/")
def index():
    with connect() as connection:
        reports = connection.execute(
            "SELECT * FROM daily_reports ORDER BY report_date DESC LIMIT 45"
        ).fetchall()
    return render_template("reports.html", reports=reports, report=reports[0] if reports else None)


@app.get("/reports/<report_date>")
def report_detail(report_date):
    with connect() as connection:
        report = connection.execute(
            "SELECT * FROM daily_reports WHERE report_date = %s", (report_date,)
        ).fetchone()
        reports = connection.execute(
            "SELECT * FROM daily_reports ORDER BY report_date DESC LIMIT 45"
        ).fetchall()
    if not report:
        abort(404)
    return render_template("reports.html", reports=reports, report=report)


@app.get("/health")
def health():
    return {"ok": True}


seed_with_retry()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))
