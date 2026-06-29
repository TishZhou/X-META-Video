from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from xmeta_api.main import app
from xmeta_api.store import store


client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_store_and_provider_env(monkeypatch: pytest.MonkeyPatch) -> None:
    store.reset()
    for name in (
        "SCRIPT_MODEL_PROVIDER",
        "SCRIPT_MODEL_BASE_URL",
        "SCRIPT_MODEL_API_KEY",
        "SCRIPT_MODEL_NAME",
    ):
        monkeypatch.delenv(name, raising=False)


def script_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "creative_brief": "A runaway idol discovers a hidden city under the stage.",
        "content_type": "comic_drama",
        "style": "neon noir",
        "theme": "identity and trust",
        "world_setting": "a rain-soaked future music district",
        "duration_seconds": 90,
        "language": "English",
        "target_platform": "shorts",
        "audience": "young adults",
        "constraints": ["Keep scenes PG-13"],
        "references": ["Backstage mystery tone"],
    }
    payload.update(overrides)
    return payload


def save_node(project_id: str = "project-1", node_id: str = "script-1") -> dict[str, object]:
    response = client.patch(
        f"/api/v1/projects/{project_id}/nodes/{node_id}",
        json={"input": script_payload(), "settings": {"provider": "mock"}},
    )
    assert response.status_code == 200
    return response.json()


def test_patch_script_node_validates_content_type() -> None:
    response = client.patch(
        "/api/v1/projects/project-1/nodes/script-1",
        json={"input": script_payload(content_type="feature_film")},
    )

    assert response.status_code == 422


def test_patch_script_node_saves_input_and_versions_updates() -> None:
    first = save_node()
    second_response = client.patch(
        "/api/v1/projects/project-1/nodes/script-1",
        json={
            "input": script_payload(
                creative_brief="A second brief for the same script node."
            )
        },
    )

    assert second_response.status_code == 200
    second = second_response.json()
    assert first["version"] == 1
    assert second["version"] == 2
    assert second["input"]["creative_brief"] == "A second brief for the same script node."


def test_run_script_node_creates_succeeded_task_and_task_lookup() -> None:
    saved = save_node()

    run_response = client.post("/api/v1/projects/project-1/nodes/script-1/run")

    assert run_response.status_code == 202
    task = run_response.json()
    assert task["project_id"] == "project-1"
    assert task["node_id"] == "script-1"
    assert task["task_type"] == "script_node"
    assert task["status"] == "succeeded"
    assert task["input_version"] == saved["version"]
    assert task["provider"] == "mock"

    lookup_response = client.get(f"/api/v1/tasks/{task['task_id']}")
    assert lookup_response.status_code == 200
    assert lookup_response.json() == task


def test_task_result_returns_deterministic_mock_script_output() -> None:
    save_node()
    task = client.post("/api/v1/projects/project-1/nodes/script-1/run").json()

    result_response = client.get(f"/api/v1/tasks/{task['task_id']}/result")

    assert result_response.status_code == 200
    result_body = result_response.json()
    result = result_body["output"]
    assert result_body["status"] == "succeeded"
    assert result["title"] == "Comic Drama: A runaway idol discovers a hidden city under the"
    assert result["characters"][0]["name"] == "Lead"
    assert result["story_beats"][0]["beat"] == "Opening hook"
    assert result["shot_plan"][0]["duration_seconds"] == 30
    assert result["dialogue_or_lyrics"][0]["speaker"] == "Lead"
    assert result["camera_notes"]
    assert result["scene_prompts"]
    assert result["audio_notes"]
    assert result["production_checklist"]
    assert result["missing_inputs"] == []


def test_non_mock_provider_fails_clearly_when_config_is_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    save_node()
    monkeypatch.setenv("SCRIPT_MODEL_PROVIDER", "openai-compatible")

    response = client.post("/api/v1/projects/project-1/nodes/script-1/run")

    assert response.status_code == 503
    detail = response.json()["detail"]
    assert "openai-compatible" in detail
    assert "SCRIPT_MODEL_BASE_URL" in detail
    assert "SCRIPT_MODEL_API_KEY" in detail
    assert "SCRIPT_MODEL_NAME" in detail
