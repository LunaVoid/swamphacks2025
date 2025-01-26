from fastapi.testclient import TestClient
from demo import app




client = TestClient(app)


def test_send_command():
    response = client.post("/send-command", json={"command": "Turn on the lights"})
    assert response.status_code == 200
    assert response.json()["status"] == "success"