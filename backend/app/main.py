from typing import Annotated
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.orm import Session, selectinload

from app.config import settings
from app.database import get_db
from app.models import Course, Item, LearningSession, Project, SessionItem
from app.schemas import (
    CourseBreadcrumbRead,
    CourseRead,
    CourseSummaryRead,
    ItemRead,
    ItemSummaryRead,
    ProjectRead,
    ProjectSummaryWithCourseCountRead,
    SessionItemRead,
    SessionRead,
)

app = FastAPI(title="Show & Tell API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health(db: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}


@app.get("/api/projects", response_model=list[ProjectSummaryWithCourseCountRead])
def list_projects(
    db: Annotated[Session, Depends(get_db)],
) -> list[ProjectSummaryWithCourseCountRead]:
    projects = db.scalars(
        select(Project)
        .options(selectinload(Project.courses))
        .order_by(Project.name)
    ).all()

    return [
        ProjectSummaryWithCourseCountRead(
            id=project.id,
            slug=project.slug,
            name=project.name,
            course_count=len(project.courses),
        )
        for project in projects
    ]


@app.get("/api/items", response_model=list[ItemSummaryRead])
def list_items(db: Annotated[Session, Depends(get_db)]) -> list[ItemSummaryRead]:
    items = db.scalars(
        select(Item).options(selectinload(Item.slides)).order_by(Item.title)
    ).all()
    return [
        ItemSummaryRead(
            id=item.id,
            slug=item.slug,
            title=item.title,
            summary=item.summary,
            slide_count=len(item.slides),
        )
        for item in items
    ]


@app.get("/api/items/{item_id}", response_model=ItemRead)
def get_item(item_id: UUID, db: Annotated[Session, Depends(get_db)]) -> ItemRead:
    statement = (
        select(Item)
        .where(Item.id == item_id)
        .options(selectinload(Item.slides), selectinload(Item.categories))
    )
    item = db.scalar(statement)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemRead.model_validate(item)


@app.get("/api/projects/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: UUID, db: Annotated[Session, Depends(get_db)]
) -> Project:
    statement = (
        select(Project)
        .where(Project.id == project_id)
        .options(selectinload(Project.courses).selectinload(Course.sessions))
    )
    project = db.scalar(statement)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectRead(
        id=project.id,
        slug=project.slug,
        name=project.name,
        description=project.description,
        courses=[
            CourseSummaryRead(
                id=course.id,
                slug=course.slug,
                title=course.title,
                session_count=len(course.sessions),
            )
            for course in sorted(project.courses, key=lambda item: item.title)
        ],
    )


@app.get("/api/courses/{course_id}", response_model=CourseRead)
def get_course(course_id: UUID, db: Annotated[Session, Depends(get_db)]) -> CourseRead:
    statement = (
        select(Course)
        .where(Course.id == course_id)
        .options(
            selectinload(Course.project),
            selectinload(Course.sessions)
            .selectinload(LearningSession.session_items)
            .selectinload(SessionItem.item)
            .selectinload(Item.slides),
        )
    )
    course = db.scalar(statement)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseRead(
        id=course.id,
        slug=course.slug,
        title=course.title,
        description=course.description,
        project=course.project,
        sessions=[
            {
                "id": session.id,
                "slug": session.slug,
                "title": session.title,
                "position": session.position,
                "slide_count": sum(
                    len(association.item.slides)
                    for association in session.session_items
                ),
            }
            for session in sorted(course.sessions, key=lambda item: item.position)
        ],
    )


@app.get("/api/sessions/{session_id}", response_model=SessionRead)
def get_session(
    session_id: UUID, db: Annotated[Session, Depends(get_db)]
) -> SessionRead:
    statement = (
        select(LearningSession)
        .where(LearningSession.id == session_id)
        .options(
            selectinload(LearningSession.session_items)
            .selectinload(SessionItem.item)
            .selectinload(Item.slides),
            selectinload(LearningSession.session_items)
            .selectinload(SessionItem.item)
            .selectinload(Item.categories),
            selectinload(LearningSession.course).selectinload(Course.project),
        )
    )
    session = db.scalar(statement)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionRead(
        id=session.id,
        slug=session.slug,
        title=session.title,
        description=session.description,
        position=session.position,
        items=[
            SessionItemRead(
                position=association.position,
                item=ItemRead.model_validate(association.item),
            )
            for association in session.session_items
        ],
        course=CourseBreadcrumbRead.model_validate(session.course),
    )
