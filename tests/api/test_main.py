
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "version" in response.json()
    assert "environment" in response.json()

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_process_agent_request():
    test_request = {
        "prompt": "test prompt",
        "context": {}
    }
    response = client.post("/agent/process", json=test_request)
    assert response.status_code == 200
    assert "response" in response.json()
    assert "status" in response.json()

@pytest.mark.parametrize("invalid_request", [
    {"context": {}},  # missing prompt
    {"prompt": "test"},  # missing context
    {},  # empty request
])
def test_process_agent_request_validation(invalid_request):
    response = client.post("/agent/process", json=invalid_request)
    assert response.status_code == 422  # validation error

