from typing import Annotated
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.orm import Session, selectinload

from app.config import settings
from app.database import get_db
from app.models import Course, CourseGroup, LearningSession, Milestone
from app.schemas import CourseGroupRead, SessionRead

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


@app.get("/api/dashboard", response_model=list[CourseGroupRead])
def dashboard(db: Annotated[Session, Depends(get_db)]) -> list[CourseGroupRead]:
    groups = db.scalars(select(CourseGroup).order_by(CourseGroup.name)).all()
    courses = db.scalars(
        select(Course)
        .options(
            selectinload(Course.sessions)
            .selectinload(LearningSession.milestones)
            .selectinload(Milestone.slides)
        )
        .order_by(Course.title)
    ).all()

    group_nodes: dict[UUID, dict] = {
        group.id: {"id": group.id, "name": group.name, "children": [], "courses": []}
        for group in groups
    }
    roots: list[dict] = []

    for group in groups:
        node = group_nodes[group.id]
        if group.parent_id and group.parent_id in group_nodes:
            group_nodes[group.parent_id]["children"].append(node)
        else:
            roots.append(node)

    for course in courses:
        node = group_nodes.get(course.group_id)
        if node is not None:
            node["courses"].append(
                {
                    "id": course.id,
                    "slug": course.slug,
                    "title": course.title,
                    "sessions": [
                        {
                            "id": session.id,
                            "slug": session.slug,
                            "title": session.title,
                            "position": session.position,
                            "slide_count": sum(
                                len(milestone.slides) for milestone in session.milestones
                            ),
                        }
                        for session in course.sessions
                    ],
                }
            )

    return [CourseGroupRead.model_validate(node) for node in roots]


@app.get("/api/sessions/{session_id}", response_model=SessionRead)
def get_session(
    session_id: UUID, db: Annotated[Session, Depends(get_db)]
) -> LearningSession:
    statement = (
        select(LearningSession)
        .where(LearningSession.id == session_id)
        .options(
            selectinload(LearningSession.milestones)
            .selectinload(Milestone.slides),
            selectinload(LearningSession.milestones)
            .selectinload(Milestone.categories),
        )
    )
    session = db.scalar(statement)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
