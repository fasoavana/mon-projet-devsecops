
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from SecureTask.backend.app import app, get_db
from SecureTask.backend.database import Base
from SecureTask.backend import models, utils

# Configuration de la base de données de test
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(name="db_session")
def db_session_fixture():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(name="client")
def client_fixture(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


def get_auth_client(client, username="testuser", password="testpassword"):
    client.post("/register", data={"username": username, "password": password})
    response = client.post("/login", data={"username": username, "password": password})
    token = response.cookies["access_token"]
    client.headers.update({"Authorization": token})
    return client


def test_add_task(client):
    auth_client = get_auth_client(client)
    response = auth_client.post("/add_task", data={"task_description": "Ma première tâche"})
    assert response.status_code == 302
    assert response.headers["location"] == "/dashboard"

    dashboard_response = auth_client.get("/dashboard")
    assert "Ma première tâche" in dashboard_response.text


def test_dashboard_shows_only_user_tasks(client):
    # User 1
    auth_client_1 = get_auth_client(client, username="user1", password="pass1")
    auth_client_1.post("/add_task", data={"task_description": "Tâche de User 1"})

    # User 2
    auth_client_2 = get_auth_client(client, username="user2", password="pass2")
    auth_client_2.post("/add_task", data={"task_description": "Tâche de User 2"})

    dashboard_response_1 = auth_client_1.get("/dashboard")
    assert "Tâche de User 1" in dashboard_response_1.text
    assert "Tâche de User 2" not in dashboard_response_1.text

    dashboard_response_2 = auth_client_2.get("/dashboard")
    assert "Tâche de User 2" in dashboard_response_2.text
    assert "Tâche de User 1" not in dashboard_response_2.text
