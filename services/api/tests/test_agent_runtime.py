from __future__ import annotations

from collections.abc import Mapping
from dataclasses import replace

import pytest
from fastapi.testclient import TestClient

from xmeta_api.agent_runtime import (
    AgentRuntime,
    EmptyProjectMemoryReader,
    MemoryScope,
    NodeKind,
    PromptCompiler,
    TaskId,
    TaskProfileNotFoundError,
    TaskProfileRegistry,
    ValidatorId,
    create_default_task_registry,
)
from xmeta_api.agent_runtime.memory import ProjectMemoryReader
from xmeta_api.agent_runtime.nodes import (
    AudioNodeExecutor,
    ImageNodeExecutor,
    TextNodeExecutor,
    VideoNodeExecutor,
)
from xmeta_api.agent_runtime.prompts import build_script_prompt
from xmeta_api.agent_runtime.runtime import AgentRuntime as FacadeAgentRuntime
from xmeta_api.agent_runtime.validators import (
    RuntimeOutputValidationError,
    validate_output,
)
from xmeta_api.main import app
from xmeta_api.providers import (
    ArkSeedanceVideoProviderSettings,
    MiniMaxMusicProviderSettings,
    ProviderExecutionError,
    SeedDreamProviderSettings,
    VideoGenerationProviderResult,
)
from xmeta_api.schemas import (
    GeneratedAudio,
    GeneratedImage,
    GeneratedVideo,
    ImageGenerationRequest,
    MusicGenerationRequest,
    ScriptDialogueMessage,
    ScriptDialogueMode,
    ScriptInput,
    ScriptOutput,
    ScriptSettings,
    TaskStatus,
    VideoGenerationRequest,
)
from xmeta_api.store import InMemoryScriptStore, store


class RecordingMemoryReader(ProjectMemoryReader):
    def __init__(self) -> None:
        self.calls: list[tuple[str, tuple[MemoryScope, ...]]] = []

    def read(
        self,
        *,
        project_id: str,
        scopes: tuple[MemoryScope, ...],
    ) -> Mapping[MemoryScope | str, object]:
        self.calls.append((project_id, scopes))
        return {
            MemoryScope.PROJECT_BIBLE: {"title": "Neon summer"},
            MemoryScope.CONTINUITY: {"unrequested": True},
        }


class DialogueProvider:
    name = "test-dialogue"

    def __init__(self, reply: str = "Make the chorus visually brighter.") -> None:
        self.reply = reply
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
        return self.reply


def test_package_exports_runtime_facade_from_final_module() -> None:
    assert AgentRuntime is FacadeAgentRuntime
    assert AgentRuntime.__module__ == "xmeta_api.agent_runtime.runtime"


def test_node_executors_own_node_specific_execution() -> None:
    assert (
        TextNodeExecutor.run_script_task_sync.__module__
        == "xmeta_api.agent_runtime.nodes.text"
    )
    assert ImageNodeExecutor.run_generation.__module__ == "xmeta_api.agent_runtime.nodes.image"
    assert AudioNodeExecutor.run_generation.__module__ == "xmeta_api.agent_runtime.nodes.audio"
    assert VideoNodeExecutor.run_generation.__module__ == "xmeta_api.agent_runtime.nodes.video"


def test_default_registry_declares_contracts_for_each_current_node_kind() -> None:
    profiles = create_default_task_registry().all()

    assert {profile.node_kind for profile in profiles} == set(NodeKind)
    assert {profile.task_id for profile in profiles} == set(TaskId)
    for profile in profiles:
        assert profile.required_inputs
        assert profile.prompt_template_id
        assert profile.output_type
        assert profile.validator_id
        assert profile.retry_limit == 0
        assert len(profile.memory_reads) == len(set(profile.memory_reads))


def test_registry_rejects_unknown_task_identity() -> None:
    registry = create_default_task_registry()

    with pytest.raises(TaskProfileNotFoundError, match="Unknown agent task"):
        registry.get("image.unknown.generate")


def test_empty_memory_reader_is_truthful_and_prompt_remains_compatible() -> None:
    profile = create_default_task_registry().get(TaskId.TEXT_SCRIPT_GENERATE)
    compiler = PromptCompiler(EmptyProjectMemoryReader())
    script_input = ScriptInput(world_description="A moonlit desert road MV.")

    compiled = compiler.compile(
        profile=profile,
        project_id="project-1",
        inputs={"script_input": script_input},
    )

    assert compiled.memory == {}
    assert compiled.text == build_script_prompt(script_input)


def test_prompt_compiler_requests_and_uses_only_profile_memory_scopes() -> None:
    reader = RecordingMemoryReader()
    profile = create_default_task_registry().get(TaskId.TEXT_SCRIPT_GENERATE)
    compiler = PromptCompiler(reader)

    compiled = compiler.compile(
        profile=profile,
        project_id="project-7",
        inputs={"script_input": ScriptInput(world_description="A city-pop MV.")},
    )

    assert reader.calls == [("project-7", profile.memory_reads)]
    assert set(compiled.memory) == {MemoryScope.PROJECT_BIBLE}
    assert "Neon summer" in compiled.text
    assert "unrequested" not in compiled.text


def test_image_handler_preserves_existing_prompt_and_response_contract() -> None:
    runtime = AgentRuntime()
    request = ImageGenerationRequest.model_validate(
        {
            "node_type": "character_image",
            "input": {"prompt": "Full-body character reference."},
        }
    )
    seen: list[dict[str, object]] = []

    def execute(**kwargs: object) -> GeneratedImage:
        seen.append(kwargs)
        if len(seen) == 1:
            return GeneratedImage(
                url="https://image.example/character-base.png",
                b64_json="base-image-bytes",
                mime_type="image/png",
            )
        return GeneratedImage(url="https://image.example/character-sheet.png")

    response = runtime.run_image_generation(
        project_id="project-1",
        node_id="character-1",
        request=request,
        settings=SeedDreamProviderSettings(
            provider="doubao-seedream",
            model="doubao-seedream-5-0-260128",
        ),
        execute=execute,
    )

    assert seen[0]["prompt"] == (
        "Full-body character reference.\n\nOutput variant: character base image. "
        "Produce one full-body, front-facing character reference with a clean, "
        "readable silhouette."
    )
    character_sheet_prompt = str(seen[1]["prompt"])
    for constraint in (
        "sole visual reference",
        "facial features, skin tone, hair texture, body type, wardrobe, accessories",
        "3:4 character design sheet",
        "no words, labels, captions, or typography",
        "front, side, and back views",
        "joy, sadness, anger, surprise, fear, neutral",
        "walking, running, jumping, seated",
    ):
        assert constraint in character_sheet_prompt
    assert seen[0]["reference_image_url"] is None
    assert seen[1]["reference_image_url"] == "https://image.example/character-base.png"
    assert seen[1]["reference_image_b64"] == "base-image-bytes"
    assert seen[1]["reference_image_mime_type"] == "image/png"
    assert response.image.url == "https://image.example/character-base.png"
    assert [(output.variant, output.image.url) for output in response.images] == [
        ("character_base", "https://image.example/character-base.png"),
        ("character_three_view", "https://image.example/character-sheet.png"),
    ]


def test_runtime_consumes_custom_bounded_retry_limit() -> None:
    registry = create_default_task_registry()
    profiles = [
        replace(profile, retry_limit=1)
        if profile.task_id == TaskId.IMAGE_CHARACTER_GENERATE
        else profile
        for profile in registry.all()
    ]
    runtime = AgentRuntime(registry=TaskProfileRegistry(profiles))
    request = ImageGenerationRequest.model_validate(
        {
            "node_type": "character_image",
            "input": {"prompt": "Full-body character reference."},
        }
    )
    attempts = 0

    def execute(**kwargs: object) -> GeneratedImage:
        nonlocal attempts
        del kwargs
        attempts += 1
        if attempts == 1:
            raise RuntimeError("transient test failure")
        return GeneratedImage(url="https://image.example/retried.png")

    response = runtime.run_image_generation(
        project_id="project-1",
        node_id="character-1",
        request=request,
        settings=SeedDreamProviderSettings(model="seedream-test"),
        execute=execute,
    )

    assert attempts == 3
    assert response.image.url == "https://image.example/retried.png"


def test_dialogue_handler_compiles_prompt_and_returns_provider_text() -> None:
    runtime = AgentRuntime()
    provider = DialogueProvider()

    result = runtime.run_script_dialogue(
        project_id="project-1",
        provider=provider,
        script_input=ScriptInput(world_description="A neon road-trip MV."),
        history=[ScriptDialogueMessage(role="assistant", content="Keep the opening quiet.")],
        user_message="Strengthen the chorus.",
        mode=ScriptDialogueMode.DIALOGUE,
    )

    assert result == "Make the chorus visually brighter."
    assert "Strengthen the chorus." in provider.prompts[0]
    assert "Keep the opening quiet." in provider.prompts[0]


def test_script_task_handler_preserves_failed_task_state() -> None:
    class FailingScriptProvider(DialogueProvider):
        def generate(self, script_input: ScriptInput, prompt: str) -> ScriptOutput:
            del script_input, prompt
            raise RuntimeError("Script generation failed.")

    runtime = AgentRuntime()
    script_store = InMemoryScriptStore()
    node = script_store.save_node(
        "project-1",
        "script-1",
        ScriptInput(world_description="A neon road-trip MV."),
        ScriptSettings(provider="openai-compatible", model="text-test"),
    )
    task = script_store.create_task(
        project_id=node.project_id,
        node_id=node.node_id,
        input_version=node.version,
        provider="openai-compatible",
        model="text-test",
    )

    failed = runtime.run_script_task_sync(
        store=script_store,
        provider=FailingScriptProvider(),
        task=task,
        node=node,
    )

    assert failed.status == TaskStatus.FAILED
    assert failed.error == "Script generation failed."
    assert script_store.get_result(task.task_id) is None


def test_dialogue_route_preserves_provider_execution_error_mapping(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class FailingDialogueProvider(DialogueProvider):
        def chat(
            self,
            script_input: ScriptInput,
            history: list[ScriptDialogueMessage],
            user_message: str,
            prompt: str,
        ) -> str:
            del script_input, history, user_message, prompt
            raise ProviderExecutionError("Text provider failed.")

    store.reset()
    monkeypatch.setattr(
        "xmeta_api.main.get_script_provider",
        lambda settings: FailingDialogueProvider(),
    )

    response = TestClient(app).post(
        "/api/v1/projects/project-1/nodes/script-1/chat",
        json={
            "input": {"world_description": "A neon road-trip MV."},
            "settings": {
                "provider": "openai-compatible",
                "model": "text-test",
            },
            "message": "Strengthen the chorus.",
        },
    )

    assert response.status_code == 502
    assert response.json()["detail"] == "Text provider failed."
    store.reset()


def test_audio_handler_preserves_inputs_and_returns_typed_response() -> None:
    runtime = AgentRuntime()
    request = MusicGenerationRequest.model_validate(
        {
            "node_type": "audio",
            "input": {
                "prompt": "Dream-pop with warm synths.",
                "lyrics": "Run into the light",
            },
        }
    )
    seen: dict[str, object] = {}

    def execute(**kwargs: object) -> GeneratedAudio:
        seen.update(kwargs)
        return GeneratedAudio(url="https://audio.example/song.mp3", duration_ms=30000)

    response = runtime.run_audio_generation(
        project_id="project-1",
        node_id="audio-1",
        request=request,
        settings=MiniMaxMusicProviderSettings(model="music-test"),
        execute=execute,
    )

    assert seen["prompt"] == "Dream-pop with warm synths."
    assert seen["lyrics"] == "Run into the light"
    assert response.audio.url == "https://audio.example/song.mp3"
    assert response.persisted is False


def test_video_handler_accepts_provider_task_id_without_ready_video() -> None:
    runtime = AgentRuntime()
    request = VideoGenerationRequest.model_validate(
        {
            "node_type": "video",
            "input": {
                "prompt": "Animate the keyframe with a slow camera push.",
                "image_urls": ["https://image.example/keyframe.png"],
                "duration_seconds": 6,
            },
        }
    )
    seen: dict[str, object] = {}

    def execute(**kwargs: object) -> VideoGenerationProviderResult:
        seen.update(kwargs)
        return VideoGenerationProviderResult(
            video=GeneratedVideo(),
            provider_task_id="queued-video-task",
        )

    response = runtime.run_video_generation(
        project_id="project-1",
        node_id="video-1",
        request=request,
        settings=ArkSeedanceVideoProviderSettings(model="seedance-test"),
        execute=execute,
    )

    assert seen["duration_seconds"] == 6
    assert response.task_id == "queued-video-task"
    assert response.provider_task_id == "queued-video-task"
    assert response.video.url is None


@pytest.mark.parametrize(
    ("validator_id", "output", "message"),
    [
        (ValidatorId.NON_EMPTY_TEXT, "", "non-empty text"),
        (ValidatorId.GENERATED_IMAGE, GeneratedImage(), "did not return an image"),
        (ValidatorId.GENERATED_AUDIO, GeneratedAudio(), "did not return audio"),
        (
            ValidatorId.GENERATED_VIDEO,
            VideoGenerationProviderResult(video=GeneratedVideo()),
            "video URL or provider task id",
        ),
    ],
)
def test_output_validators_reject_empty_provider_results(
    validator_id: ValidatorId,
    output: object,
    message: str,
) -> None:
    with pytest.raises(RuntimeOutputValidationError, match=message):
        validate_output(validator_id, output)
