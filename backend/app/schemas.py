from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SlideRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    summary: str
    body: str
    position: int


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str


class MilestoneRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    summary: str
    position: int
    categories: list[CategoryRead]
    slides: list[SlideRead]


class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    description: str
    position: int
    milestones: list[MilestoneRead]


class SessionSummaryRead(BaseModel):
    id: UUID
    slug: str
    title: str
    position: int
    slide_count: int


class CourseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    sessions: list[SessionSummaryRead]


class CourseGroupRead(BaseModel):
    id: UUID
    name: str
    children: list[CourseGroupRead] = Field(default_factory=list)
    courses: list[CourseRead] = Field(default_factory=list)


CourseGroupRead.model_rebuild()
