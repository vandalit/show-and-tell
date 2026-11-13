from __future__ import annotations

import uuid

from sqlalchemy import (
    CheckConstraint,
    Column,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid


class Base(DeclarativeBase):
    pass


item_categories = Table(
    "item_categories",
    Base.metadata,
    Column(
        "item_id",
        Uuid(as_uuid=True),
        ForeignKey("items.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "category_id",
        Uuid(as_uuid=True),
        ForeignKey("categories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")

    courses: Mapped[list[Course]] = relationship(back_populates="project")


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    project: Mapped[Project] = relationship(back_populates="courses")
    sessions: Mapped[list[LearningSession]] = relationship(
        back_populates="course", order_by="LearningSession.position"
    )


class LearningSession(Base):
    __tablename__ = "sessions"
    __table_args__ = (
        UniqueConstraint("course_id", "position", name="uq_sessions_course_position"),
        CheckConstraint("position >= 0", name="ck_sessions_position_nonnegative"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )

    course: Mapped[Course] = relationship(back_populates="sessions")
    session_items: Mapped[list[SessionItem]] = relationship(
        back_populates="session",
        order_by="SessionItem.position",
        cascade="all, delete-orphan",
    )


class Item(Base):
    __tablename__ = "items"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")

    session_items: Mapped[list[SessionItem]] = relationship(
        back_populates="item", cascade="all, delete-orphan"
    )
    slides: Mapped[list[Slide]] = relationship(
        back_populates="item", order_by="Slide.position", cascade="all, delete-orphan"
    )
    categories: Mapped[list[Category]] = relationship(
        secondary=item_categories, back_populates="items", order_by="Category.name"
    )


class SessionItem(Base):
    __tablename__ = "session_items"
    __table_args__ = (
        UniqueConstraint("session_id", "position", name="uq_session_items_session_position"),
        CheckConstraint("position >= 0", name="ck_session_items_position_nonnegative"),
    )

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sessions.id", ondelete="CASCADE"), primary_key=True
    )
    item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"), primary_key=True
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    session: Mapped[LearningSession] = relationship(back_populates="session_items")
    item: Mapped[Item] = relationship(back_populates="session_items")


class Slide(Base):
    __tablename__ = "slides"
    __table_args__ = (
        UniqueConstraint("item_id", "position", name="uq_slides_item_position"),
        CheckConstraint("position >= 0", name="ck_slides_position_nonnegative"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True
    )

    item: Mapped[Item] = relationship(back_populates="slides")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )

    parent: Mapped[Category | None] = relationship(
        back_populates="children", remote_side="Category.id"
    )
    children: Mapped[list[Category]] = relationship(back_populates="parent")
    items: Mapped[list[Item]] = relationship(
        secondary=item_categories, back_populates="categories"
    )
