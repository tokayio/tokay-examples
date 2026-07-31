"""Create support tickets and annotations.

Revision ID: 0001_support_dashboard
Revises:
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001_support_dashboard"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "support_tickets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("subject", sa.String(length=180), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False),
        sa.Column("opened_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("first_response_minutes", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint(
            "category IN ('Account access', 'Billing', 'Delivery', 'Product help')",
            name="support_tickets_category_check",
        ),
        sa.CheckConstraint(
            "priority IN ('Low', 'Normal', 'High', 'Urgent')",
            name="support_tickets_priority_check",
        ),
        sa.CheckConstraint("first_response_minutes >= 0", name="support_tickets_response_check"),
    )
    op.create_index("support_tickets_opened_at_idx", "support_tickets", ["opened_at"])
    op.create_index("support_tickets_resolved_at_idx", "support_tickets", ["resolved_at"])
    op.create_index("support_tickets_category_idx", "support_tickets", ["category"])

    op.create_table(
        "support_annotations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("annotation_date", sa.Date(), nullable=False, unique=True),
        sa.Column("note", sa.String(length=240), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_table("support_annotations")
    op.drop_index("support_tickets_category_idx", table_name="support_tickets")
    op.drop_index("support_tickets_resolved_at_idx", table_name="support_tickets")
    op.drop_index("support_tickets_opened_at_idx", table_name="support_tickets")
    op.drop_table("support_tickets")
