from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict


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


class ProjectSummaryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    name: str


class CourseBreadcrumbRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    project: ProjectSummaryRead


class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    description: str
    position: int
    milestones: list[MilestoneRead]
    course: CourseBreadcrumbRead


class SessionSummaryRead(BaseModel):
    id: UUID
    slug: str
    title: str
    position: int
    slide_count: int


class CourseSummaryRead(BaseModel):
    id: UUID
    slug: str
    title: str
    session_count: int


class ProjectSummaryWithCourseCountRead(ProjectSummaryRead):
    course_count: int


class ProjectRead(ProjectSummaryRead):
    description: str
    courses: list[CourseSummaryRead]


class CourseRead(BaseModel):
    id: UUID
    slug: str
    title: str
    description: str
    project: ProjectSummaryRead
    sessions: list[SessionSummaryRead]
