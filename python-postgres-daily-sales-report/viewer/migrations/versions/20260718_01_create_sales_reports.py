from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260718_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "orders",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("ordered_on", sa.Date(), nullable=False),
        sa.Column("item", sa.Text(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price_cents", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("orders_ordered_on_idx", "orders", ["ordered_on"])
    op.create_table(
        "daily_reports",
        sa.Column("report_date", sa.Date(), primary_key=True),
        sa.Column("revenue_cents", sa.BigInteger(), nullable=False),
        sa.Column("order_count", sa.Integer(), nullable=False),
        sa.Column("top_items", postgresql.JSONB(), nullable=False),
        sa.Column("week_revenue_cents", sa.BigInteger(), nullable=False),
        sa.Column("previous_week_revenue_cents", sa.BigInteger(), nullable=False),
        sa.Column("week_change_percent", sa.Numeric(8, 2), nullable=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )


def downgrade():
    op.drop_table("daily_reports")
    op.drop_index("orders_ordered_on_idx", table_name="orders")
    op.drop_table("orders")
