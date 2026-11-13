"""Model existing milestones as reusable items.

Revision ID: 0003_reusable_items
Revises: 0002_projects
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003_reusable_items"
down_revision: str | None = "0002_projects"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "items",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.execute(
        sa.text(
            """
            INSERT INTO items (id, slug, title, summary)
            SELECT id, slug, title, summary FROM milestones
            """
        )
    )

    op.create_table(
        "session_items",
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("item_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.CheckConstraint(
            "position >= 0", name="ck_session_items_position_nonnegative"
        ),
        sa.ForeignKeyConstraint(["item_id"], ["items.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("session_id", "item_id"),
        sa.UniqueConstraint(
            "session_id", "position", name="uq_session_items_session_position"
        ),
    )
    op.execute(
        sa.text(
            """
            INSERT INTO session_items (session_id, item_id, position)
            SELECT session_id, id, position FROM milestones
            """
        )
    )

    op.create_table(
        "item_categories",
        sa.Column("item_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["item_id"], ["items.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("item_id", "category_id"),
    )
    op.execute(
        sa.text(
            """
            INSERT INTO item_categories (item_id, category_id)
            SELECT milestone_id, category_id FROM milestone_categories
            """
        )
    )

    op.add_column(
        "slides",
        sa.Column("item_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.execute(sa.text("UPDATE slides SET item_id = milestone_id"))
    op.alter_column(
        "slides",
        "item_id",
        existing_type=postgresql.UUID(as_uuid=True),
        nullable=False,
    )
    op.create_foreign_key(
        None, "slides", "items", ["item_id"], ["id"], ondelete="CASCADE"
    )
    op.create_index("ix_slides_item_id", "slides", ["item_id"])
    op.drop_constraint(
        "uq_slides_milestone_position", "slides", type_="unique"
    )
    op.create_unique_constraint(
        "uq_slides_item_position", "slides", ["item_id", "position"]
    )
    op.drop_constraint("slides_milestone_id_fkey", "slides", type_="foreignkey")
    op.drop_index("ix_slides_milestone_id", table_name="slides")
    op.drop_column("slides", "milestone_id")

    op.drop_table("milestone_categories")
    op.drop_index("ix_milestones_session_id", table_name="milestones")
    op.drop_table("milestones")


def downgrade() -> None:
    connection = op.get_bind()
    incompatible_items = connection.execute(
        sa.text(
            """
            SELECT COUNT(*)
            FROM (
                SELECT items.id
                FROM items
                LEFT JOIN session_items ON session_items.item_id = items.id
                GROUP BY items.id
                HAVING COUNT(session_items.session_id) <> 1
            ) AS non_reversible_items
            """
        )
    ).scalar_one()
    if incompatible_items:
        raise RuntimeError(
            "Cannot downgrade reusable items while an item belongs to zero or "
            "multiple sessions."
        )

    op.create_table(
        "milestones",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.CheckConstraint(
            "position >= 0", name="ck_milestones_position_nonnegative"
        ),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id", "position", name="uq_milestones_session_position"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_milestones_session_id", "milestones", ["session_id"])
    op.execute(
        sa.text(
            """
            INSERT INTO milestones (id, slug, title, summary, position, session_id)
            SELECT items.id, items.slug, items.title, items.summary,
                   session_items.position, session_items.session_id
            FROM items
            JOIN session_items ON session_items.item_id = items.id
            """
        )
    )

    op.create_table(
        "milestone_categories",
        sa.Column("milestone_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["milestone_id"], ["milestones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("milestone_id", "category_id"),
    )
    op.execute(
        sa.text(
            """
            INSERT INTO milestone_categories (milestone_id, category_id)
            SELECT item_id, category_id FROM item_categories
            """
        )
    )

    op.add_column(
        "slides",
        sa.Column("milestone_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.execute(sa.text("UPDATE slides SET milestone_id = item_id"))
    op.alter_column(
        "slides",
        "milestone_id",
        existing_type=postgresql.UUID(as_uuid=True),
        nullable=False,
    )
    op.create_foreign_key(
        None, "slides", "milestones", ["milestone_id"], ["id"], ondelete="CASCADE"
    )
    op.create_index("ix_slides_milestone_id", "slides", ["milestone_id"])
    op.drop_constraint("uq_slides_item_position", "slides", type_="unique")
    op.create_unique_constraint(
        "uq_slides_milestone_position", "slides", ["milestone_id", "position"]
    )
    op.drop_constraint("slides_item_id_fkey", "slides", type_="foreignkey")
    op.drop_index("ix_slides_item_id", table_name="slides")
    op.drop_column("slides", "item_id")

    op.drop_table("item_categories")
    op.drop_table("session_items")
    op.drop_table("items")
