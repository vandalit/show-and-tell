import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.database import get_db
from app.main import app
from app.models import Base, Category, Course, LearningSession, Milestone, Project, Slide


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
        project = Project(slug="project", name="Project")
        db.add(Project(slug="empty-project", name="Adalid"))
        course = Course(slug="course", title="Course", project=project)
        Course(slug="course-2", title="Course 2", project=project)
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
        db.add(project)
        db.commit()

    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()


def test_projects_endpoint_lists_projects(client: TestClient) -> None:
    response = client.get("/api/projects")

    assert response.status_code == 200
    payload = response.json()
    assert [project["name"] for project in payload] == ["Adalid", "Project"]
    assert payload[0]["course_count"] == 0


def test_project_course_and_session_navigation_data(client: TestClient) -> None:
    projects = client.get("/api/projects").json()
    project_id = next(project["id"] for project in projects if project["name"] == "Project")

    project_response = client.get(f"/api/projects/{project_id}")
    assert project_response.status_code == 200
    project = project_response.json()
    assert [course["title"] for course in project["courses"]] == ["Course", "Course 2"]
    course_id = project["courses"][0]["id"]

    course_response = client.get(f"/api/courses/{course_id}")
    assert course_response.status_code == 200
    course = course_response.json()
    assert course["project"]["id"] == project_id
    assert course["sessions"][0]["slide_count"] == 2

    session_response = client.get(f"/api/sessions/{course['sessions'][0]['id']}")
    assert session_response.status_code == 200
    assert session_response.json()["course"]["project"]["name"] == "Project"


def test_player_returns_ordered_slides_and_categories(client: TestClient) -> None:
    projects = client.get("/api/projects").json()
    project = next(project for project in projects if project["name"] == "Project")
    session_id = client.get(f"/api/projects/{project['id']}").json()["courses"][0]["id"]
    session_id = client.get(f"/api/courses/{session_id}").json()["sessions"][0]["id"]

    response = client.get(f"/api/sessions/{session_id}")

    assert response.status_code == 200
    milestone = response.json()["milestones"][0]
    assert [slide["title"] for slide in milestone["slides"]] == ["Slide 1", "Slide 2"]
    assert milestone["categories"][0]["name"] == "Category"


def test_player_returns_not_found_for_unknown_session(client: TestClient) -> None:
    response = client.get(f"/api/sessions/{uuid.uuid4()}")

    assert response.status_code == 404
