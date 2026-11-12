import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.database import get_db
from app.main import app
from app.models import Base, Category, Course, CourseGroup, LearningSession, Milestone, Slide


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)

    def override_get_db():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    with Session(engine) as db:
        group = CourseGroup(slug="root", name="Root")
        course = Course(slug="course", title="Course", group=group)
        session = LearningSession(
            slug="session",
            title="Session",
            position=0,
            course=course,
        )
        category = Category(slug="category", name="Category")
        milestone = Milestone(
            slug="milestone",
            title="Milestone",
            position=0,
            session=session,
            categories=[category],
        )
        milestone.slides.extend(
            [
                Slide(title="Slide 1", position=0),
                Slide(title="Slide 2", position=1),
            ]
        )
        db.add(group)
        db.commit()

    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()


def test_dashboard_returns_course_hierarchy_and_slide_counts(client: TestClient) -> None:
    response = client.get("/api/dashboard")

    assert response.status_code == 200
    payload = response.json()
    assert payload[0]["name"] == "Root"
    assert payload[0]["courses"][0]["title"] == "Course"
    assert payload[0]["courses"][0]["sessions"][0]["slide_count"] == 2


def test_player_returns_ordered_slides_and_categories(client: TestClient) -> None:
    session_id = client.get("/api/dashboard").json()[0]["courses"][0]["sessions"][0]["id"]

    response = client.get(f"/api/sessions/{session_id}")

    assert response.status_code == 200
    milestone = response.json()["milestones"][0]
    assert [slide["title"] for slide in milestone["slides"]] == ["Slide 1", "Slide 2"]
    assert milestone["categories"][0]["name"] == "Category"


def test_player_returns_not_found_for_unknown_session(client: TestClient) -> None:
    response = client.get(f"/api/sessions/{uuid.uuid4()}")

    assert response.status_code == 404
