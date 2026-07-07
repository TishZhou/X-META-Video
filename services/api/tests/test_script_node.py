from __future__ import annotations

import json

import httpx
import pytest
from fastapi.testclient import TestClient

from xmeta_api.main import _resolve_script_provider_settings, app
from xmeta_api.providers import (
    OpenAICompatibleScriptProvider,
    ProviderExecutionError,
    ScriptProviderSettings,
)
from xmeta_api.schemas import ScriptDialogueMessage, ScriptInput, ScriptSettings
from xmeta_api.store import store


client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_store_and_provider_env(monkeypatch: pytest.MonkeyPatch) -> None:
    store.reset()
    for name in (
        "TEXT_MODEL_PROVIDER",
        "TEXT_MODEL_BASE_URL",
        "TEXT_MODEL_API_KEY",
        "TEXT_MODEL_NAME",
        "TEXT_MODEL_TEMPERATURE",
        "TEXT_MODEL_TIMEOUT_SECONDS",
        "TEXT_MODEL_MAX_RETRIES",
        "SCRIPT_MODEL_PROVIDER",
        "SCRIPT_MODEL_BASE_URL",
        "SCRIPT_MODEL_API_KEY",
        "SCRIPT_MODEL_NAME",
        "SCRIPT_MODEL_TEMPERATURE",
        "SCRIPT_MODEL_TIMEOUT_SECONDS",
        "SCRIPT_MODEL_MAX_RETRIES",
        "OPENAI_BASE_URL",
        "OPENAI_API_KEY",
    ):
        monkeypatch.delenv(name, raising=False)


def script_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "world_description": (
            "A sweet summer MV world with two girls, a desert jeep, and a neon stage."
        ),
    }
    payload.update(overrides)
    return payload


def save_node(
    project_id: str = "project-1",
    node_id: str = "script-1",
    settings: dict[str, object] | None = None,
) -> dict[str, object]:
    response = client.patch(
        f"/api/v1/projects/{project_id}/nodes/{node_id}",
        json={
            "input": script_payload(),
            "settings": {"provider": "mock"} if settings is None else settings,
        },
    )
    assert response.status_code == 200
    return response.json()


def test_patch_script_node_validates_required_world_description() -> None:
    response = client.patch(
        "/api/v1/projects/project-1/nodes/script-1",
        json={"input": script_payload(world_description="")},
    )

    assert response.status_code == 422


def test_patch_script_node_saves_input_and_versions_updates() -> None:
    first = save_node()
    second_response = client.patch(
        "/api/v1/projects/project-1/nodes/script-1",
        json={
            "input": script_payload(
                world_description="A second MV world for the same script node."
            )
        },
    )

    assert second_response.status_code == 200
    second = second_response.json()
    assert first["version"] == 1
    assert second["version"] == 2
    assert (
        second["input"]["world_description"]
        == "A second MV world for the same script node."
    )


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
    assert result["title"] == "MV World: A sweet summer MV world with two girls, a desert"
    assert "road-movie MV world" in result["agent_output"]
    assert "world-view description" in result["world_overview"]
    assert "third-person cinematic POV" in result["storyboard_direction"]["pov"]
    assert result["storyboard_direction"]["shots"][0]["shot_number"] == 1
    assert result["characters"][0]["name"] == "Lead Girl"
    assert result["characters"][0]["overview"] == (
        "Sweet visual direction with a lonely, determined core."
    )
    assert result["scene_descriptions"][0]["location"] == (
        "desert highway beside a vintage jeep"
    )
    assert "desert jeep" in result["scene_descriptions"][0]["visual_prompt"]
    assert result["missing_inputs"] == []


def test_script_node_chat_returns_backend_dialogue_history() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/script-1/chat",
        json={
            "input": script_payload(),
            "settings": {"provider": "mock"},
            "history": [
                {
                    "role": "assistant",
                    "content": "Previous script suggestion.",
                }
            ],
            "message": "Make the two leads argue before the chorus.",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["project_id"] == "project-1"
    assert body["node_id"] == "script-1"
    assert body["provider"] == "mock"
    assert body["message"]["role"] == "assistant"
    assert "Make the two leads argue before the chorus." in body["message"]["content"]
    assert body["history"][-2] == {
        "role": "user",
        "content": "Make the two leads argue before the chorus.",
    }
    assert body["history"][-1] == body["message"]


def test_script_node_chat_validates_required_user_message() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/script-1/chat",
        json={
            "input": script_payload(),
            "settings": {"provider": "mock"},
            "message": "",
        },
    )

    assert response.status_code == 422


def test_saved_mock_provider_settings_override_env_openai_without_credentials(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("TEXT_MODEL_PROVIDER", "openai")
    monkeypatch.setenv("TEXT_MODEL_NAME", "gpt-env")
    saved = save_node(settings={"provider": "mock", "model": "local-script-mock"})

    response = client.post("/api/v1/projects/project-1/nodes/script-1/run")

    assert response.status_code == 202
    task = response.json()
    assert task["status"] == "succeeded"
    assert task["provider"] == "mock"
    assert task["input_version"] == saved["version"]


def test_node_provider_settings_override_env_model_and_temperature(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("TEXT_MODEL_PROVIDER", "mock")
    monkeypatch.setenv("TEXT_MODEL_BASE_URL", "https://text-model.test/v1")
    monkeypatch.setenv("TEXT_MODEL_API_KEY", "server-key")
    monkeypatch.setenv("TEXT_MODEL_NAME", "env-model")
    monkeypatch.setenv("TEXT_MODEL_TEMPERATURE", "0.1")
    monkeypatch.setenv("TEXT_MODEL_TIMEOUT_SECONDS", "42")
    monkeypatch.setenv("TEXT_MODEL_MAX_RETRIES", "3")

    settings = _resolve_script_provider_settings(
        ScriptSettings(provider="OpenAI", model="node-model", temperature=0.7)
    )

    assert settings.provider == "openai"
    assert settings.model == "node-model"
    assert settings.temperature == 0.7
    assert settings.base_url == "https://text-model.test/v1"
    assert settings.api_key == "server-key"
    assert settings.timeout_seconds == 42
    assert settings.max_retries == 3


def test_text_model_config_defaults_to_mock() -> None:
    settings = ScriptProviderSettings.from_env()

    assert settings.provider == "mock"
    assert settings.base_url == "https://api.openai.com/v1"
    assert settings.api_key is None
    assert settings.model == "gpt-5.4-mini"
    assert settings.temperature is None
    assert settings.timeout_seconds == 60
    assert settings.max_retries == 1


def test_text_model_config_falls_back_to_openai_api_key(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("TEXT_MODEL_PROVIDER", "openai")
    monkeypatch.setenv("OPENAI_API_KEY", "openai-key")

    settings = ScriptProviderSettings.from_env()

    assert settings.provider == "openai"
    assert settings.base_url == "https://api.openai.com/v1"
    assert settings.api_key == "openai-key"
    assert settings.model == "gpt-5.4-mini"


def test_text_model_config_supports_legacy_script_model_env(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("SCRIPT_MODEL_PROVIDER", "openai-compatible")
    monkeypatch.setenv("SCRIPT_MODEL_BASE_URL", "https://legacy-openai.test/v1")
    monkeypatch.setenv("SCRIPT_MODEL_API_KEY", "legacy-key")
    monkeypatch.setenv("SCRIPT_MODEL_NAME", "legacy-model")

    settings = ScriptProviderSettings.from_env()

    assert settings.provider == "openai-compatible"
    assert settings.base_url == "https://legacy-openai.test/v1"
    assert settings.api_key == "legacy-key"
    assert settings.model == "legacy-model"


def test_text_model_provider_fails_clearly_when_config_is_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    save_node(settings={"provider": "openai"})

    response = client.post("/api/v1/projects/project-1/nodes/script-1/run")

    assert response.status_code == 503
    detail = response.json()["detail"]
    assert "openai" in detail
    assert "TEXT_MODEL_API_KEY or OPENAI_API_KEY" in detail


def test_text_model_provider_fails_clearly_for_invalid_numeric_env(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    save_node(settings={})
    monkeypatch.setenv("TEXT_MODEL_PROVIDER", "openai")
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setenv("TEXT_MODEL_TIMEOUT_SECONDS", "slow")

    response = client.post("/api/v1/projects/project-1/nodes/script-1/run")

    assert response.status_code == 503
    assert response.json()["detail"] == "TEXT_MODEL_TIMEOUT_SECONDS must be an integer."


def test_text_model_provider_rejects_unsupported_provider_name(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    save_node(settings={})
    monkeypatch.setenv("TEXT_MODEL_PROVIDER", "seedance")
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")

    response = client.post("/api/v1/projects/project-1/nodes/script-1/run")

    assert response.status_code == 503
    detail = response.json()["detail"]
    assert "seedance" in detail
    assert "Allowed providers" in detail


def valid_script_output_json() -> str:
    return json.dumps(
        {
            "title": "Generated MV",
            "agent_output": "This is the agent answer shown in chat history.",
            "world_overview": "A validated generated world overview.",
            "storyboard_direction": {
                "pov": "third-person cinematic",
                "visual_rhythm": "slow build into a bright performance hook",
                "shots": [
                    {
                        "shot_number": 1,
                        "pov": "third-person",
                        "framing": "wide",
                        "action": "Introduce the desert jeep world.",
                        "camera_movement": "slow push",
                        "duration_seconds": 8,
                    }
                ],
            },
            "characters": [
                {
                    "name": "Lead",
                    "overview": "Optimistic lead.",
                    "style": "idol road movie",
                    "clothing": "white jacket and pink skirt",
                    "height": "165 cm",
                    "appearance": "bright eyes and shoulder-length hair",
                    "personality": "gentle but determined",
                    "visual_prompt": "idol lead full-body reference",
                }
            ],
            "scene_descriptions": [
                {
                    "scene_number": 1,
                    "shot_reference": 1,
                    "characters": ["Lead"],
                    "location": "desert road",
                    "description": "A desert road opening scene.",
                    "visual_prompt": "desert road, vintage jeep, MV scene",
                }
            ],
            "missing_inputs": [],
        }
    )


def test_openai_compatible_provider_posts_responses_api_and_reads_output_text() -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["url"] = str(request.url)
        seen["authorization"] = request.headers["authorization"]
        seen["payload"] = json.loads(request.content)
        return httpx.Response(200, json={"output_text": valid_script_output_json()})

    provider = OpenAICompatibleScriptProvider(
        ScriptProviderSettings(
            provider="openai-compatible",
            base_url="https://api.openai.test/v1/",
            api_key="test-key",
            model="gpt-test",
            temperature=0.4,
        ),
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    result = provider.generate(ScriptInput(**script_payload()), "Return ScriptOutput JSON.")

    assert seen["url"] == "https://api.openai.test/v1/responses"
    assert seen["authorization"] == "Bearer test-key"
    assert seen["payload"] == {
        "model": "gpt-test",
        "input": "Return ScriptOutput JSON.",
        "temperature": 0.4,
    }
    assert result.title == "Generated MV"
    assert result.characters[0].name == "Lead"
    assert result.agent_output == "This is the agent answer shown in chat history."


def test_openai_compatible_provider_posts_chat_prompt_and_reads_output_text() -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["url"] = str(request.url)
        seen["authorization"] = request.headers["authorization"]
        seen["payload"] = json.loads(request.content)
        return httpx.Response(200, json={"output_text": "AI chat reply from provider."})

    provider = OpenAICompatibleScriptProvider(
        ScriptProviderSettings(
            provider="openai-compatible",
            base_url="https://api.openai.test/v1/",
            api_key="test-key",
            model="gpt-test",
            temperature=0.4,
        ),
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    result = provider.chat(
        ScriptInput(**script_payload()),
        [
            ScriptDialogueMessage(
                role="assistant",
                content="Previous answer.",
            )
        ],
        "Add more tension.",
        "Script dialogue prompt.",
    )

    assert seen["url"] == "https://api.openai.test/v1/responses"
    assert seen["authorization"] == "Bearer test-key"
    assert seen["payload"] == {
        "model": "gpt-test",
        "input": "Script dialogue prompt.",
        "temperature": 0.4,
    }
    assert result == "AI chat reply from provider."


def test_openai_compatible_provider_falls_back_to_output_content_text() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(
            200,
            json={
                "output": [
                    {
                        "content": [
                            {
                                "type": "output_text",
                                "text": valid_script_output_json(),
                            }
                        ]
                    }
                ]
            },
        )

    provider = OpenAICompatibleScriptProvider(
        ScriptProviderSettings(
            provider="openai-compatible",
            base_url="https://api.openai.test/v1",
            api_key="test-key",
            model="gpt-test",
        ),
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    result = provider.generate(ScriptInput(**script_payload()), "Return ScriptOutput JSON.")

    assert result.storyboard_direction.shots[0].action == "Introduce the desert jeep world."


def test_openai_compatible_provider_uses_raw_text_when_agent_output_is_missing() -> None:
    response_text = json.dumps(
        json.loads(valid_script_output_json()) | {"agent_output": None}
    )

    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={"output_text": response_text})

    provider = OpenAICompatibleScriptProvider(
        ScriptProviderSettings(
            provider="openai-compatible",
            base_url="https://api.openai.test/v1",
            api_key="test-key",
            model="gpt-test",
        ),
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    result = provider.generate(ScriptInput(**script_payload()), "Return ScriptOutput JSON.")

    assert result.agent_output == response_text


def test_openai_compatible_provider_accepts_fenced_json_output() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(
            200,
            json={"output_text": f"```json\n{valid_script_output_json()}\n```"},
        )

    provider = OpenAICompatibleScriptProvider(
        ScriptProviderSettings(
            provider="openai",
            base_url="https://api.openai.test/v1",
            api_key="test-key",
            model="gpt-test",
        ),
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    result = provider.generate(ScriptInput(**script_payload()), "Return ScriptOutput JSON.")

    assert result.title == "Generated MV"


def test_openai_compatible_provider_rejects_missing_output_text() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={"output": []})

    provider = OpenAICompatibleScriptProvider(
        ScriptProviderSettings(
            provider="openai",
            base_url="https://api.openai.test/v1",
            api_key="test-key",
            model="gpt-test",
        ),
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    with pytest.raises(ProviderExecutionError, match="did not include output text"):
        provider.generate(ScriptInput(**script_payload()), "Return ScriptOutput JSON.")


def test_openai_compatible_provider_rejects_invalid_json() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={"output_text": "not json"})

    provider = OpenAICompatibleScriptProvider(
        ScriptProviderSettings(
            provider="openai",
            base_url="https://api.openai.test/v1",
            api_key="test-key",
            model="gpt-test",
        ),
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    with pytest.raises(ProviderExecutionError, match="invalid JSON"):
        provider.generate(ScriptInput(**script_payload()), "Return ScriptOutput JSON.")


def test_openai_compatible_provider_rejects_schema_invalid_json() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={"output_text": "{}"})

    provider = OpenAICompatibleScriptProvider(
        ScriptProviderSettings(
            provider="openai",
            base_url="https://api.openai.test/v1",
            api_key="test-key",
            model="gpt-test",
        ),
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    with pytest.raises(ProviderExecutionError, match="does not match ScriptOutput"):
        provider.generate(ScriptInput(**script_payload()), "Return ScriptOutput JSON.")


def test_openai_compatible_provider_reports_http_failure() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(500, json={"error": "upstream failed"})

    provider = OpenAICompatibleScriptProvider(
        ScriptProviderSettings(
            provider="openai",
            base_url="https://api.openai.test/v1",
            api_key="test-key",
            model="gpt-test",
            max_retries=0,
        ),
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    with pytest.raises(ProviderExecutionError, match="Text model request failed"):
        provider.generate(ScriptInput(**script_payload()), "Return ScriptOutput JSON.")
