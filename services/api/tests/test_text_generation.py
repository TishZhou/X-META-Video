from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from xmeta_api.agent_runtime import (
    PromptTemplateId,
    TaskId,
    ValidatorId,
    create_default_task_registry,
)
from xmeta_api.agent_runtime.validators import (
    RuntimeOutputValidationError,
    validate_output,
)
from xmeta_api.main import app
from xmeta_api.providers import ScriptProviderSettings
from xmeta_api.schemas import ScriptDialogueMessage, ScriptInput, ScriptOutput


client = TestClient(app)


class FakeTextProvider:
    name = "openai-compatible"

    def __init__(
        self,
        *,
        invalid_output: bool = False,
        response_override: str | None = None,
    ) -> None:
        self.invalid_output = invalid_output
        self.response_override = response_override
        self.prompts: list[str] = []

    def generate(self, script_input: ScriptInput, prompt: str) -> ScriptOutput:
        del script_input, prompt
        raise NotImplementedError

    def chat(
        self,
        script_input: ScriptInput,
        history: list[ScriptDialogueMessage],
        user_message: str,
        prompt: str,
    ) -> str:
        del script_input, history, user_message
        self.prompts.append(prompt)
        if self.response_override is not None:
            return self.response_override
        if self.invalid_output:
            return "A response without the required task elements."
        if "every named character" in prompt:
            return (
                "Mira 的视觉造型以红棕色长辫和电影感穿搭为核心。"
                "她的个性坚定而克制，肢体表现沉稳舒展；人声为成熟中低音，"
                "唱腔带有稳定的胸腔共鸣。"
            )
        return (
            "IP叙事定位：冰核梦境中的羁绊唤醒故事。\n"
            "核心主题：温柔记忆与舞台生命力。\n"
            "世界观规则：现实冰原与梦境圣殿通过裂痕互通。\n"
            "人物定位：Luna 主导仪式，Mira 负责突破。"
        )


def install_fake_provider(
    monkeypatch: pytest.MonkeyPatch,
    *,
    invalid_output: bool = False,
    response_override: str | None = None,
) -> FakeTextProvider:
    provider = FakeTextProvider(
        invalid_output=invalid_output,
        response_override=response_override,
    )
    settings = ScriptProviderSettings(
        provider="openai-compatible",
        base_url="https://text.example/v1",
        api_key="test-key",
        model="text-test",
    )
    monkeypatch.setattr(
        "xmeta_api.main._resolve_script_provider_settings",
        lambda request_settings: settings,
    )
    monkeypatch.setattr("xmeta_api.main.get_script_provider", lambda value: provider)
    return provider


def test_runtime_registers_separate_text_task_profiles() -> None:
    registry = create_default_task_registry()
    worldview = registry.get(TaskId.TEXT_IP_WORLDVIEW_GENERATE)
    characters = registry.get(TaskId.TEXT_CHARACTER_PROFILES_GENERATE)

    assert worldview.prompt_template_id == PromptTemplateId.TEXT_IP_WORLDVIEW_V1
    assert characters.prompt_template_id == PromptTemplateId.TEXT_CHARACTER_PROFILES_V1
    assert worldview.validator_id == ValidatorId.IP_WORLDVIEW_TEXT
    assert characters.validator_id == ValidatorId.CHARACTER_PROFILES_TEXT
    assert worldview.output_type == "TextContent:script"
    assert characters.output_type == "TextContent:character"


def test_generate_text_task_1_returns_canonical_content_and_compact_metadata(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    provider = install_fake_provider(monkeypatch)
    response = client.post(
        "/api/v1/projects/project-1/nodes/script-1/generate-text",
        json={
            "task": "ip_worldview",
            "input": {
                "content": "四位少女在冰核梦境中用歌舞唤醒世界。",
                "source": {"type": "manual"},
            },
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["project_id"] == "project-1"
    assert body["node_id"] == "script-1"
    assert body["node_type"] == "script"
    assert body["provider"] == "openai-compatible"
    assert body["model"] == "text-test"
    assert body["persisted"] is False
    assert "世界观规则" in body["content"]
    assert body["metadata"] == {
        "task": "ip_worldview",
        "data_type": "script",
        "input_source": {
            "type": "manual",
            "source_node_id": None,
            "source_task": None,
        },
        "prompt_template_id": "text.ip_worldview.v1",
    }
    assert "Shared rules:" in provider.prompts[-1]
    assert provider.prompts[-1].count("Shared rules:") == 1
    assert "named character positioning" in provider.prompts[-1]
    assert "stable appearance language" not in provider.prompts[-1]


def test_generate_text_task_2_preserves_connected_task_1_source(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    provider = install_fake_provider(monkeypatch)
    response = client.post(
        "/api/v1/projects/project-1/nodes/script-2/generate-text",
        json={
            "task": "character_profiles",
            "input": {
                "content": "世界观：冰核梦境。人物：Mira，红发、勇敢、主舞。",
                "source": {
                    "type": "connected_task_1",
                    "source_node_id": "script-1:script-outcome",
                    "source_task": "ip_worldview",
                },
            },
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert "红棕色长辫" in body["content"]
    assert "个性坚定而克制" in body["content"]
    assert "肢体表现沉稳舒展" in body["content"]
    assert "人声为成熟中低音" in body["content"]
    assert body["metadata"]["task"] == "character_profiles"
    assert body["metadata"]["data_type"] == "character"
    assert body["metadata"]["input_source"]["type"] == "connected_task_1"
    assert body["metadata"]["prompt_template_id"] == "text.character_profiles.v1"
    assert provider.prompts[-1].count("Shared rules:") == 1
    assert "every named character" in provider.prompts[-1]
    assert "appearance/visual look" in provider.prompts[-1]
    assert "personality/temperament" in provider.prompts[-1]
    assert "voice/vocal tone/timbre" in provider.prompts[-1]
    assert "fixed labels" in provider.prompts[-1]
    assert "[Character:" not in provider.prompts[-1]
    assert "named character positioning" not in provider.prompts[-1]


def test_generate_text_rejects_empty_content_and_incomplete_task_1_source() -> None:
    empty_response = client.post(
        "/api/v1/projects/project-1/nodes/script-1/generate-text",
        json={
            "task": "character_profiles",
            "input": {"content": "", "source": {"type": "manual"}},
        },
    )
    missing_source_response = client.post(
        "/api/v1/projects/project-1/nodes/script-1/generate-text",
        json={
            "task": "character_profiles",
            "input": {
                "content": "Task 1 text",
                "source": {"type": "connected_task_1"},
            },
        },
    )

    assert empty_response.status_code == 422
    assert missing_source_response.status_code == 422


def test_generate_text_maps_task_validator_failure_to_bad_gateway(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    install_fake_provider(monkeypatch, invalid_output=True)
    response = client.post(
        "/api/v1/projects/project-1/nodes/script-1/generate-text",
        json={
            "task": "ip_worldview",
            "input": {"content": "A brief idea", "source": {"type": "manual"}},
        },
    )

    assert response.status_code == 502
    assert "missing required elements" in response.json()["detail"]


def test_character_profile_validator_accepts_unstructured_chinese_synonyms() -> None:
    natural_character_text = (
        "Mira 的视觉造型以红棕色长辫和皮质穿搭为核心，个性坚定果敢，"
        "肢体表现沉稳；她的人声是成熟中低音，唱腔厚实。"
        "Luna 用银白色长卷发塑造清冷形象，气质温柔，姿态轻盈，"
        "嗓音空灵，适合治愈系演唱。"
    )

    validate_output(ValidatorId.CHARACTER_PROFILES_TEXT, natural_character_text)


def test_character_profile_validator_rejects_missing_voice_element() -> None:
    missing_voice = (
        "Mira 有红棕色长辫，外貌冷艳利落；她的性格坚定果敢，动作沉稳。"
        "Luna 留着银白色长卷发，性格温柔，动作轻盈。"
    )

    with pytest.raises(RuntimeOutputValidationError, match="voice/timbre"):
        validate_output(ValidatorId.CHARACTER_PROFILES_TEXT, missing_voice)


def test_generate_text_rejects_output_missing_voice_element(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    install_fake_provider(
        monkeypatch,
        response_override=(
            "Mira 有红棕色长辫，外貌冷艳利落；她的性格坚定果敢，动作沉稳。"
            "Luna 留着银白色长卷发，性格温柔，动作轻盈。"
        ),
    )
    response = client.post(
        "/api/v1/projects/project-1/nodes/script-1/generate-text",
        json={
            "task": "character_profiles",
            "input": {
                "content": "世界观与人物定位。",
                "source": {"type": "manual"},
            },
        },
    )

    assert response.status_code == 502
    assert "voice/timbre" in response.json()["detail"]
