import json
import os
import sys
from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal

import psycopg
from psycopg.rows import dict_row


def revenue_between(connection, start, end):
    row = connection.execute(
        """
        SELECT COALESCE(SUM(quantity * unit_price_cents), 0) AS revenue
        FROM orders
        WHERE ordered_on BETWEEN %s AND %s
        """,
        (start, end),
    ).fetchone()
    return int(row["revenue"])


def main():
    report_date = date.today() - timedelta(days=1)
    with psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row) as connection:
        orders = connection.execute(
            "SELECT item, quantity, unit_price_cents FROM orders WHERE ordered_on = %s ORDER BY item",
            (report_date,),
        ).fetchall()
        for order in orders:
            if order["quantity"] <= 0 or order["unit_price_cents"] < 0:
                raise ValueError(f"Invalid order data for {order['item']} on {report_date}")

        item_revenue = defaultdict(int)
        revenue = 0
        for order in orders:
            line_total = order["quantity"] * order["unit_price_cents"]
            item_revenue[order["item"]] += line_total
            revenue += line_total
        top_items = [
            {"name": name, "revenue_cents": amount}
            for name, amount in sorted(item_revenue.items(), key=lambda item: (-item[1], item[0]))[:3]
        ]

        week_start = report_date - timedelta(days=6)
        previous_end = week_start - timedelta(days=1)
        previous_start = previous_end - timedelta(days=6)
        week_revenue = revenue_between(connection, week_start, report_date)
        previous_revenue = revenue_between(connection, previous_start, previous_end)
        change = None if previous_revenue == 0 else Decimal(week_revenue - previous_revenue) * 100 / Decimal(previous_revenue)

        connection.execute(
            """
            INSERT INTO daily_reports
              (report_date, revenue_cents, order_count, top_items, week_revenue_cents,
               previous_week_revenue_cents, week_change_percent, generated_at)
            VALUES (%s, %s, %s, %s::jsonb, %s, %s, %s, now())
            ON CONFLICT (report_date) DO UPDATE SET
              revenue_cents = EXCLUDED.revenue_cents,
              order_count = EXCLUDED.order_count,
              top_items = EXCLUDED.top_items,
              week_revenue_cents = EXCLUDED.week_revenue_cents,
              previous_week_revenue_cents = EXCLUDED.previous_week_revenue_cents,
              week_change_percent = EXCLUDED.week_change_percent,
              generated_at = now()
            """,
            (report_date, revenue, len(orders), json.dumps(top_items), week_revenue, previous_revenue, change),
        )
    print(json.dumps({"event": "daily_sales_report", "date": str(report_date), "revenue_cents": revenue, "orders": len(orders)}))
    print(f"Daily report ready for {report_date}. {len(orders)} orders and ${revenue / 100:.2f} revenue.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Daily report failed. {error}", file=sys.stderr)
        raise
