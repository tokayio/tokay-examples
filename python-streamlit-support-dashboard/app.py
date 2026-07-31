import os
import random
import uuid
from datetime import date, datetime, time, timedelta, timezone

import pandas as pd
import streamlit as st
from sqlalchemy import create_engine, text


DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")


@st.cache_resource
def database_engine():
    url = DATABASE_URL
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    return create_engine(url, pool_pre_ping=True)


engine = database_engine()

CATEGORIES = ["Account access", "Billing", "Delivery", "Product help"]
SUBJECTS = {
    "Account access": [
        "Password reset link expired",
        "New teammate cannot sign in",
        "Account email needs changing",
    ],
    "Billing": [
        "Receipt needed for last month",
        "Duplicate charge question",
        "Billing address needs updating",
    ],
    "Delivery": [
        "Shipment has not moved",
        "Address correction requested",
        "Package marked delivered early",
    ],
    "Product help": [
        "Export does not include notes",
        "Need help setting up a template",
        "Report filter is confusing",
    ],
}
SEED_NAMESPACE = uuid.UUID("7f9b2cd4-9f08-4f8f-9146-28994e845bd5")


def seed_dashboard() -> None:
    today = datetime.now(timezone.utc).date()
    randomizer = random.Random(4817)
    tickets = []
    for days_ago in range(89, -1, -1):
        opened_on = today - timedelta(days=days_ago)
        weekday_weight = 2 if opened_on.weekday() < 5 else 0
        count = randomizer.randint(1, 4) + weekday_weight
        if 24 <= days_ago <= 27:
            count += 4
        for number in range(count):
            category = randomizer.choices(CATEGORIES, weights=[24, 18, 31, 27], k=1)[0]
            priority = randomizer.choices(["Low", "Normal", "High", "Urgent"], weights=[10, 59, 25, 6], k=1)[0]
            opened_at = datetime.combine(
                opened_on,
                time(hour=randomizer.randint(8, 17), minute=randomizer.choice([5, 15, 25, 35, 45, 55])),
                tzinfo=timezone.utc,
            )
            response_minutes = max(3, int(randomizer.lognormvariate(3.25, 0.55)))
            open_chance = 0.06 if days_ago > 14 else 0.18 if days_ago > 3 else 0.42
            stays_open = randomizer.random() < open_chance
            resolution_hours = randomizer.randint(2, 70) + (22 if category == "Delivery" else 0)
            resolved_at = None if stays_open else opened_at + timedelta(hours=resolution_hours)
            if resolved_at and resolved_at > datetime.now(timezone.utc):
                resolved_at = None
            seed_key = f"{opened_on.isoformat()}-{number}"
            tickets.append({
                "id": uuid.uuid5(SEED_NAMESPACE, f"ticket-{seed_key}"),
                "subject": randomizer.choice(SUBJECTS[category]),
                "category": category,
                "priority": priority,
                "opened_at": opened_at,
                "resolved_at": resolved_at,
                "first_response_minutes": response_minutes,
            })

    notes = [
        (today - timedelta(days=25), "Backlog spike followed a carrier routing change."),
        (today - timedelta(days=14), "Account questions rose after the new teammate rollout."),
        (today - timedelta(days=4), "Response time improved after the morning queue review."),
    ]

    with engine.begin() as connection:
        connection.execute(text("SELECT pg_advisory_xact_lock(hashtext('support-dashboard-seed'))"))
        if connection.execute(text("SELECT count(*) FROM support_tickets")).scalar_one() == 0:
            connection.execute(text("""
                INSERT INTO support_tickets
                    (id, subject, category, priority, opened_at, resolved_at, first_response_minutes)
                VALUES
                    (:id, :subject, :category, :priority, :opened_at, :resolved_at, :first_response_minutes)
            """), tickets)
        if connection.execute(text("SELECT count(*) FROM support_annotations")).scalar_one() == 0:
            connection.execute(text("""
                INSERT INTO support_annotations (id, annotation_date, note)
                VALUES (:id, :annotation_date, :note)
            """), [{
                "id": uuid.uuid5(SEED_NAMESPACE, f"note-{annotation_date.isoformat()}"),
                "annotation_date": annotation_date,
                "note": note,
            } for annotation_date, note in notes])


def load_frame(query: str, params=None) -> pd.DataFrame:
    return pd.read_sql(text(query), engine, params=params or {})


seed_dashboard()

today = date.today()
default_start = today - timedelta(days=29)

st.set_page_config(page_title="Support Desk Pulse", page_icon="◉", layout="wide")
st.markdown("""
<style>
  [data-testid="stAppViewContainer"] { background: #f4f2ed; }
  [data-testid="stHeader"] { background: transparent; }
  [data-testid="stMetric"] { background: #fffdf8; border: 1px solid #ded9ce; border-radius: 12px; padding: 16px; }
  .support-kicker { color: #a24e3a; font-size: .76rem; font-weight: 750; letter-spacing: .12em; text-transform: uppercase; }
  .support-note { color: #66706b; max-width: 760px; font-size: 1.05rem; line-height: 1.6; }
</style>
""", unsafe_allow_html=True)

st.markdown('<p class="support-kicker">Customer support operations</p>', unsafe_allow_html=True)
st.title("Support desk pulse")
st.markdown(
    '<p class="support-note">A working view of the queue for the people answering it. Filter the history, find the pressure, and leave context for the next shift.</p>',
    unsafe_allow_html=True,
)

with st.sidebar:
    st.header("View")
    selected_range = st.date_input(
        "Date range",
        value=(default_start, today),
        min_value=today - timedelta(days=89),
        max_value=today,
    )
    st.caption("The dashboard includes 90 days of fictional support activity.")

if isinstance(selected_range, (tuple, list)) and len(selected_range) == 2:
    start_date, end_date = selected_range
else:
    start_date, end_date = default_start, today

metrics = load_frame("""
    SELECT
        count(*) FILTER (WHERE resolved_at IS NULL)::int AS open_now,
        count(*) FILTER (WHERE opened_at::date BETWEEN :start_date AND :end_date)::int AS opened_in_range,
        count(*) FILTER (WHERE resolved_at::date BETWEEN :start_date AND :end_date)::int AS resolved_in_range,
        coalesce(round(percentile_cont(0.5) WITHIN GROUP (ORDER BY first_response_minutes)
            FILTER (WHERE opened_at::date BETWEEN :start_date AND :end_date))::int, 0) AS median_response
    FROM support_tickets
""", {"start_date": start_date, "end_date": end_date}).iloc[0]

metric_columns = st.columns(4)
metric_columns[0].metric("Open now", int(metrics["open_now"]))
metric_columns[1].metric("Opened in range", int(metrics["opened_in_range"]))
metric_columns[2].metric("Resolved in range", int(metrics["resolved_in_range"]))
metric_columns[3].metric("Median first response", f"{int(metrics['median_response'])} min")

daily = load_frame("""
    WITH days AS (
        SELECT generate_series(CAST(:start_date AS date), CAST(:end_date AS date), interval '1 day')::date AS day
    )
    SELECT
        days.day,
        count(tickets.id) FILTER (WHERE tickets.opened_at::date = days.day)::int AS opened,
        count(tickets.id) FILTER (WHERE tickets.resolved_at::date = days.day)::int AS resolved,
        count(tickets.id) FILTER (
            WHERE tickets.opened_at < days.day + interval '1 day'
              AND (tickets.resolved_at IS NULL OR tickets.resolved_at >= days.day + interval '1 day')
        )::int AS open_tickets
    FROM days
    LEFT JOIN support_tickets AS tickets
      ON tickets.opened_at < days.day + interval '1 day'
    GROUP BY days.day
    ORDER BY days.day
""", {"start_date": start_date, "end_date": end_date})
daily = daily.rename(columns={"opened": "Opened", "resolved": "Resolved", "open_tickets": "Open tickets"})

st.subheader("Queue history")
st.line_chart(daily, x="day", y=["Opened", "Resolved", "Open tickets"], height=330)

left, right = st.columns([1, 1.45])
with left:
    st.subheader("Current backlog")
    backlog = load_frame("""
        SELECT category, count(*)::int AS open_tickets
        FROM support_tickets
        WHERE resolved_at IS NULL
        GROUP BY category
        ORDER BY open_tickets DESC, category
    """)
    backlog = backlog.rename(columns={"category": "Category", "open_tickets": "Open tickets"})
    st.bar_chart(backlog, x="Category", y="Open tickets", height=280)

with right:
    st.subheader("Newest open tickets")
    recent = load_frame("""
        SELECT subject AS "Subject", category AS "Category", priority AS "Priority",
               opened_at::date AS "Opened", first_response_minutes AS "First response minutes"
        FROM support_tickets
        WHERE resolved_at IS NULL
        ORDER BY opened_at DESC
        LIMIT 8
    """)
    st.dataframe(recent, hide_index=True, width="stretch")

st.divider()
st.subheader("Team annotations")
st.write("Edit the note that explains a change in the queue, then save it for the next person who opens the dashboard.")
annotations = load_frame("""
    SELECT id::text AS "ID", annotation_date AS "Date", note AS "Note"
    FROM support_annotations
    ORDER BY annotation_date DESC
""")
edited_annotations = st.data_editor(
    annotations,
    hide_index=True,
    width="stretch",
    disabled=["ID", "Date"],
    column_config={"ID": None, "Date": st.column_config.DateColumn(format="MMM D, YYYY")},
    key="support_annotations_editor",
)

if st.button("Save annotations", type="primary"):
    updates = []
    for row in edited_annotations.to_dict("records"):
        note = str(row["Note"]).strip()
        if not note or len(note) > 240:
            st.error("Keep every annotation between 1 and 240 characters.")
            break
        updates.append({"id": row["ID"], "note": note})
    else:
        with engine.begin() as connection:
            connection.execute(text("""
                UPDATE support_annotations
                SET note = :note, updated_at = now()
                WHERE id = CAST(:id AS uuid)
            """), updates)
        st.success("Annotations saved.")
