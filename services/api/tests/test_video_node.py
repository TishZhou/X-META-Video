from __future__ import annotations

from collections.abc import Callable, Generator
import json

import httpx
import pytest
from fastapi.testclient import TestClient

from xmeta_api.main import app
from xmeta_api.providers import (
    ArkSeedanceVideoProviderSettings,
    ProviderExecutionError,
    VideoGenerationProviderResult,
    _load_dotenv_values,
    submitArkSeedanceVideoGenerationOnce,
    submitArkSeedanceVideoWithRetry,
)
from xmeta_api.schemas import GeneratedVideo
from xmeta_api.store import store


client = TestClient(app)


class ArkVideoTestTransport(httpx.BaseTransport):
    def __init__(self, handler: Callable[[httpx.Request], httpx.Response]) -> None:
        self._handler = handler

    def handle_request(self, request: httpx.Request) -> httpx.Response:
        response = self._handler(request)
        return httpx.Response(
            status_code=response.status_code,
            headers=response.headers,
            content=response.content,
            request=request,
            extensions=response.extensions,
        )


@pytest.fixture(autouse=True)
def clean_store_and_ark_env(
    monkeypatch: pytest.MonkeyPatch,
) -> Generator[None, None, None]:
    store.reset()
    monkeypatch.setenv("X_META_DISABLE_DOTENV", "1")
    _load_dotenv_values.cache_clear()
    for name in (
        "ARK_API_KEY",
        "ARK_BASE_URL",
        "ARK_VIDEO_MODEL",
        "ARK_VIDEO_RATIO",
        "ARK_VIDEO_GENERATE_AUDIO",
        "ARK_VIDEO_WATERMARK",
        "ARK_VIDEO_TIMEOUT_SECONDS",
        "ARK_VIDEO_MAX_RETRIES",
        "VOLCENGINE_ARK_API_KEY",
        "VOLCENGINE_ARK_BASE_URL",
        "VIDEO_MODEL_PROVIDER",
        "VIDEO_MODEL_BASE_URL",
        "VIDEO_MODEL_API_KEY",
        "VIDEO_MODEL_NAME",
        "VIDEO_MODEL_ASPECT_RATIO",
    ):
        monkeypatch.delenv(name, raising=False)
    yield
    _load_dotenv_values.cache_clear()


def video_generation_payload() -> dict[str, object]:
    return {
        "node_type": "video",
        "input": {
            "prompt": "Animate the hero walking through neon rain.",
            "image_urls": ["https://image.example/keyframe-1.png"],
            "video_urls": ["https://video.example/reference.mp4"],
            "audio_urls": ["https://audio.example/music.mp3"],
            "duration": 6,
        },
    }


def test_generate_video_node_validates_required_prompt() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/video-1/generate-video",
        json={
            "node_type": "video",
            "input": {"prompt": "", "duration_seconds": 5},
        },
    )

    assert response.status_code == 422


def test_generate_video_node_rejects_audio_without_visual_reference() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/video-1/generate-video",
        json={
            "node_type": "video",
            "input": {
                "prompt": "Animate this song as a concert clip.",
                "audio_urls": ["https://audio.example/music.mp3"],
                "duration_seconds": 5,
            },
        },
    )

    assert response.status_code == 422


def test_generate_video_node_enforces_media_and_duration_bounds() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/video-1/generate-video",
        json={
            "node_type": "video",
            "input": {
                "prompt": "Animate a scene.",
                "image_urls": [f"https://image.example/{index}.png" for index in range(10)],
                "video_urls": [f"https://video.example/{index}.mp4" for index in range(4)],
                "audio_urls": [f"https://audio.example/{index}.mp3" for index in range(4)],
                "duration_seconds": 61,
            },
        },
    )

    assert response.status_code == 422


def test_generate_video_node_returns_backend_ark_evidence(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("ARK_API_KEY", "test-ark-key")
    monkeypatch.setenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
    monkeypatch.setenv("ARK_VIDEO_MODEL", "doubao-seedance-2-0-mini-260615")
    monkeypatch.setattr(
        "xmeta_api.main.submitArkSeedanceVideoWithRetry",
        lambda **_: VideoGenerationProviderResult(
            video=GeneratedVideo(
                url="https://video.example/generated.mp4",
                mime_type="video/mp4",
                duration_ms=6000,
                width=1280,
                height=720,
                thumbnail_url="https://video.example/generated.jpg",
            ),
            provider_task_id="video-task-1",
        ),
    )

    response = client.post(
        "/api/v1/projects/project-1/nodes/video-1/generate-video",
        json=video_generation_payload(),
    )

    assert response.status_code == 200
    assert response.json() == {
        "task_id": "video-task-1",
        "project_id": "project-1",
        "node_id": "video-1",
        "node_type": "video",
        "provider": "volcengine-ark",
        "model": "doubao-seedance-2-0-mini-260615",
        "prompt": "Animate the hero walking through neon rain.",
        "image_urls": ["https://image.example/keyframe-1.png"],
        "video_urls": ["https://video.example/reference.mp4"],
        "audio_urls": ["https://audio.example/music.mp3"],
        "duration": 6,
        "duration_seconds": 6,
        "video": {
            "url": "https://video.example/generated.mp4",
            "mime_type": "video/mp4",
            "duration_ms": 6000,
            "width": 1280,
            "height": 720,
            "thumbnail_url": "https://video.example/generated.jpg",
        },
        "provider_task_id": "video-task-1",
        "persisted": False,
    }


def test_generate_video_node_allows_audio_with_video_reference(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("ARK_API_KEY", "test-ark-key")
    monkeypatch.setattr(
        "xmeta_api.main.submitArkSeedanceVideoWithRetry",
        lambda **_: VideoGenerationProviderResult(
            video=GeneratedVideo(),
            provider_task_id="video-task-queued",
        ),
    )

    response = client.post(
        "/api/v1/projects/project-1/nodes/video-1/generate-video",
        json={
            "node_type": "video",
            "input": {
                "prompt": "Use the reference video motion and this soundtrack.",
                "video_urls": ["https://video.example/reference.mp4"],
                "audio_urls": ["https://audio.example/music.mp3"],
                "duration": 11,
            },
        },
    )

    assert response.status_code == 200
    assert response.json()["video_urls"] == ["https://video.example/reference.mp4"]
    assert response.json()["audio_urls"] == ["https://audio.example/music.mp3"]


def test_generate_video_node_fails_clearly_when_ark_key_missing() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/video-1/generate-video",
        json=video_generation_payload(),
    )

    assert response.status_code == 503
    detail = response.json()["detail"]
    assert "volcengine-ark" in detail
    assert "ARK_API_KEY" in detail
    assert "test-ark-key" not in detail


def test_ark_provider_posts_content_payload_and_reads_url() -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["url"] = str(request.url)
        seen["authorization"] = request.headers["authorization"]
        seen["payload"] = json.loads(request.content)
        return httpx.Response(
            200,
            json={
                "data": {
                    "task_id": "video-task-1",
                    "video_url": "https://video.example/ark.mp4",
                    "duration": 6,
                    "width": 1280,
                    "height": 720,
                    "thumbnail_url": "https://video.example/ark.jpg",
                }
            },
        )

    result = submitArkSeedanceVideoWithRetry(
        settings=ArkSeedanceVideoProviderSettings(
            base_url="https://ark.cn-beijing.volces.com/api/v3",
            api_key="test-ark-key",
            model="doubao-seedance-2-0-mini-260615",
            ratio="16:9",
            generate_audio=True,
            watermark=False,
            max_retries=0,
        ),
        prompt="Make this keyframe into a cinematic MV shot.",
        image_urls=["https://image.example/keyframe.png"],
        video_urls=["https://video.example/reference.mp4"],
        audio_urls=["https://audio.example/music.mp3"],
        duration_seconds=6,
        client=httpx.Client(transport=ArkVideoTestTransport(handler)),
    )

    assert (
        seen["url"]
        == "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks"
    )
    assert seen["authorization"] == "Bearer test-ark-key"
    assert seen["payload"] == {
        "model": "doubao-seedance-2-0-mini-260615",
        "content": [
            {
                "type": "text",
                "text": "Make this keyframe into a cinematic MV shot.",
            },
            {
                "type": "image_url",
                "image_url": {"url": "https://image.example/keyframe.png"},
                "role": "reference_image",
            },
            {
                "type": "video_url",
                "video_url": {"url": "https://video.example/reference.mp4"},
                "role": "reference_video",
            },
            {
                "type": "audio_url",
                "audio_url": {"url": "https://audio.example/music.mp3"},
                "role": "reference_audio",
            },
        ],
        "generate_audio": True,
        "ratio": "16:9",
        "duration": 6,
        "watermark": False,
    }
    assert result.provider_task_id == "video-task-1"
    assert result.video.url == "https://video.example/ark.mp4"
    assert result.video.duration_ms == 6000
    assert result.video.width == 1280
    assert result.video.height == 720


def test_ark_provider_posts_text_payload_and_accepts_task_id_only() -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["payload"] = json.loads(request.content)
        return httpx.Response(200, json={"id": "queued-video-task"})

    result = submitArkSeedanceVideoWithRetry(
        settings=ArkSeedanceVideoProviderSettings(
            base_url=(
                "https://ark.cn-beijing.volces.com/api/v3/"
                "contents/generations/tasks"
            ),
            api_key="test-ark-key",
            model="doubao-seedance-2-0-mini-260615",
            max_retries=0,
        ),
        prompt="A neon stage camera push.",
        image_urls=[],
        video_urls=[],
        audio_urls=[],
        duration_seconds=8,
        client=httpx.Client(transport=ArkVideoTestTransport(handler)),
    )

    assert seen["payload"] == {
        "model": "doubao-seedance-2-0-mini-260615",
        "content": [{"type": "text", "text": "A neon stage camera push."}],
        "generate_audio": True,
        "ratio": "16:9",
        "duration": 8,
        "watermark": False,
    }
    assert result.provider_task_id == "queued-video-task"
    assert result.video.url is None


def test_ark_provider_rejects_response_without_video_or_task() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={"data": {}})

    with pytest.raises(ProviderExecutionError, match="video URL or task id"):
        submitArkSeedanceVideoGenerationOnce(
            settings=ArkSeedanceVideoProviderSettings(
                base_url="https://ark.cn-beijing.volces.com/api/v3",
                api_key="test-ark-key",
                model="doubao-seedance-2-0-mini-260615",
            ),
            payload={
                "model": "doubao-seedance-2-0-mini-260615",
                "content": [{"type": "text", "text": "A scene."}],
            },
            client=httpx.Client(transport=ArkVideoTestTransport(handler)),
        )


def test_ark_provider_does_not_retry_client_errors() -> None:
    calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        del request
        calls += 1
        return httpx.Response(400, json={"error": {"message": "bad request"}})

    with pytest.raises(ProviderExecutionError, match="status 400: bad request"):
        submitArkSeedanceVideoWithRetry(
            settings=ArkSeedanceVideoProviderSettings(
                base_url="https://ark.cn-beijing.volces.com/api/v3",
                api_key="test-ark-key",
                model="doubao-seedance-2-0-mini-260615",
                max_retries=2,
            ),
            prompt="A scene.",
            image_urls=["https://image.example/keyframe.png"],
            video_urls=[],
            audio_urls=[],
            duration_seconds=5,
            client=httpx.Client(transport=ArkVideoTestTransport(handler)),
        )

    assert calls == 1
