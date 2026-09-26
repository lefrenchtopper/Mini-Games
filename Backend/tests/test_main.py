from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

import main


class FakeQuery:
    def __init__(self, data):
        self.data = data

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, *_args, **_kwargs):
        return self

    def order(self, *_args, **_kwargs):
        return self

    def limit(self, *_args, **_kwargs):
        return self

    def insert(self, _data):
        return self

    def execute(self):
        return SimpleNamespace(data=self.data)


class FakeSupabase:
    def __init__(self, leaderboard_rows=None):
        self.leaderboard_rows = leaderboard_rows or []
        self.auth = SimpleNamespace(
            get_user=lambda _token: SimpleNamespace(
                user=SimpleNamespace(id="user-1", email="player@example.com")
            )
        )

    def table(self, name):
        if name == "game_scores":
            return FakeQuery(self.leaderboard_rows)
        return FakeQuery([])


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(
        main,
        "supabase",
        FakeSupabase(
            leaderboard_rows=[
                {
                    "score": 900,
                    "played_at": "2026-09-20T12:00:00+00:00",
                    "profiles": {"username": "TopPlayer"},
                },
                {
                    "score": 700,
                    "played_at": "2026-09-20T11:00:00+00:00",
                    "profiles": {"username": "SecondPlayer"},
                },
            ]
        ),
    )
    main.leaderboard_connections.connections.clear()
    return TestClient(main.app)


def test_scores_rejects_unauthenticated_request(client):
    response = client.post("/scores", json={"game": "snake", "score": 10})

    assert response.status_code == 401
    assert response.json()["detail"] == "Authorization header missing"


def test_scores_rejects_unknown_game(client):
    response = client.post(
        "/scores",
        headers={"Authorization": "Bearer test-token"},
        json={"game": "not-a-game", "score": 10},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid game"


def test_leaderboard_returns_top_scores(client):
    response = client.get("/leaderboard/snake")

    assert response.status_code == 200
    assert response.json()["leaderboard"] == [
        {
            "rank": 1,
            "username": "TopPlayer",
            "game": "snake",
            "score": 900,
            "played_at": "2026-09-20T12:00:00+00:00",
        },
        {
            "rank": 2,
            "username": "SecondPlayer",
            "game": "snake",
            "score": 700,
            "played_at": "2026-09-20T11:00:00+00:00",
        },
    ]


def test_score_submission_broadcasts_to_game_subscribers(client):
    with client.websocket_connect("/ws/leaderboard/snake") as websocket:
        response = client.post(
            "/scores",
            headers={"Authorization": "Bearer test-token"},
            json={"game": "snake", "score": 1200},
        )

        assert response.status_code == 200
        message = websocket.receive_json()
        assert message["type"] == "score_submitted"
        assert message["game"] == "snake"
