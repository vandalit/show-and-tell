"""Replace generic course groups with explicit projects.

Revision ID: 0002_projects
Revises: 0001_initial
"""
import uuid
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002_projects"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )

    project_id = uuid.uuid4()
    projects = sa.table(
        "projects",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("slug", sa.String()),
        sa.column("name", sa.String()),
        sa.column("description", sa.Text()),
    )
    op.bulk_insert(
        projects,
        [
            {
                "id": project_id,
                "slug": "desafio-latam",
                "name": "Desafío Latam",
                "description": "Proyecto educativo de demostración.",
            }
        ],
    )

    op.add_column(
        "courses",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_courses_project_id_projects",
        "courses",
        "projects",
        ["project_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index("ix_courses_project_id", "courses", ["project_id"])
    op.execute(
        sa.text("UPDATE courses SET project_id = :project_id").bindparams(
            project_id=project_id
        )
    )
    op.alter_column("courses", "project_id", nullable=False)

    op.drop_constraint("courses_group_id_fkey", "courses", type_="foreignkey")
    op.drop_index("ix_courses_group_id", table_name="courses")
    op.drop_column("courses", "group_id")
    op.drop_index("ix_course_groups_parent_id", table_name="course_groups")
    op.drop_table("course_groups")


def downgrade() -> None:
    op.create_table(
        "course_groups",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(["parent_id"], ["course_groups.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_course_groups_parent_id", "course_groups", ["parent_id"])
    op.add_column("courses", sa.Column("group_id", postgresql.UUID(as_uuid=True), nullable=True))

    connection = op.get_bind()
    course_groups = sa.table(
        "course_groups",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("slug", sa.String()),
        sa.column("name", sa.String()),
    )
    courses = sa.table(
        "courses",
        sa.column("project_id", postgresql.UUID(as_uuid=True)),
        sa.column("group_id", postgresql.UUID(as_uuid=True)),
    )
    projects = sa.table(
        "projects",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("slug", sa.String()),
        sa.column("name", sa.String()),
    )
    for project_id, slug, name in connection.execute(
        sa.select(projects.c.id, projects.c.slug, projects.c.name)
    ):
        group_id = uuid.uuid4()
        connection.execute(
            course_groups.insert().values(id=group_id, slug=slug, name=name)
        )
        connection.execute(
            courses.update()
            .where(courses.c.project_id == project_id)
            .values(group_id=group_id)
        )

    op.alter_column("courses", "group_id", nullable=False)
    op.create_foreign_key(
        "courses_group_id_fkey",
        "courses",
        "course_groups",
        ["group_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index("ix_courses_group_id", "courses", ["group_id"])
    op.drop_index("ix_courses_project_id", table_name="courses")
    op.drop_constraint("fk_courses_project_id_projects", "courses", type_="foreignkey")
    op.drop_column("courses", "project_id")
    op.drop_table("projects")
