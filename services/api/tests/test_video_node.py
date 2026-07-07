from __future__ import annotations

from collections.abc import Callable, Generator
import json

import httpx
import pytest
from fastapi.testclient import TestClient

from xmeta_api.main import app
from xmeta_api.providers import (
    EvolinkVideoProviderSettings,
    ProviderExecutionError,
    VideoGenerationProviderResult,
    _load_dotenv_values,
    submitEvolinkVideoGenerationOnce,
    submitEvolinkVideoWithRetry,
)
from xmeta_api.schemas import GeneratedVideo
from xmeta_api.store import store


client = TestClient(app)


class EvolinkVideoTestTransport(httpx.BaseTransport):
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
def clean_store_and_evolink_env(
    monkeypatch: pytest.MonkeyPatch,
) -> Generator[None, None, None]:
    store.reset()
    monkeypatch.setenv("X_META_DISABLE_DOTENV", "1")
    _load_dotenv_values.cache_clear()
    for name in (
        "EVOLINK_API_KEY",
        "EVOLINK_BASE_URL",
        "EVOLINK_VIDEO_MODEL",
        "EVOLINK_TEXT_TO_VIDEO_MODEL",
        "EVOLINK_VIDEO_QUALITY",
        "EVOLINK_VIDEO_ASPECT_RATIO",
        "EVOLINK_GENERATE_AUDIO",
        "EVOLINK_VIDEO_TIMEOUT_SECONDS",
        "EVOLINK_VIDEO_MAX_RETRIES",
        "VIDEO_MODEL_PROVIDER",
        "VIDEO_MODEL_BASE_URL",
        "VIDEO_MODEL_API_KEY",
        "VIDEO_MODEL_NAME",
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


def test_generate_video_node_rejects_audio_without_image_reference() -> None:
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
                "audio_urls": [f"https://audio.example/{index}.mp3" for index in range(4)],
                "duration_seconds": 61,
            },
        },
    )

    assert response.status_code == 422


def test_generate_video_node_returns_backend_evolink_evidence(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("EVOLINK_API_KEY", "test-evolink-key")
    monkeypatch.setenv("EVOLINK_BASE_URL", "https://api.evolink.ai/v1")
    monkeypatch.setenv("EVOLINK_VIDEO_MODEL", "seedance-2.0-reference-to-video")
    monkeypatch.setenv("EVOLINK_TEXT_TO_VIDEO_MODEL", "seedance-2.0-text-to-video")
    monkeypatch.setattr(
        "xmeta_api.main.submitEvolinkVideoWithRetry",
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
        "provider": "evolink",
        "model": "seedance-2.0-reference-to-video",
        "prompt": "Animate the hero walking through neon rain.",
        "image_urls": ["https://image.example/keyframe-1.png"],
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


def test_generate_video_node_fails_clearly_when_evolink_key_missing() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/video-1/generate-video",
        json=video_generation_payload(),
    )

    assert response.status_code == 503
    detail = response.json()["detail"]
    assert "evolink" in detail
    assert "EVOLINK_API_KEY" in detail
    assert "test-evolink-key" not in detail


def test_evolink_provider_posts_reference_payload_and_reads_url() -> None:
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
                    "video_url": "https://video.example/evolink.mp4",
                    "duration": 6,
                    "width": 1280,
                    "height": 720,
                    "thumbnail_url": "https://video.example/evolink.jpg",
                }
            },
        )

    result = submitEvolinkVideoWithRetry(
        settings=EvolinkVideoProviderSettings(
            base_url="https://api.evolink.ai/v1",
            api_key="test-evolink-key",
            model="seedance-2.0-reference-to-video",
            text_to_video_model="seedance-2.0-text-to-video",
            quality="720p",
            aspect_ratio="16:9",
            generate_audio=True,
            max_retries=0,
        ),
        prompt="Make this keyframe into a cinematic MV shot.",
        image_urls=["https://image.example/keyframe.png"],
        audio_urls=["https://audio.example/music.mp3"],
        duration_seconds=6,
        client=httpx.Client(transport=EvolinkVideoTestTransport(handler)),
    )

    assert seen["url"] == "https://api.evolink.ai/v1/videos/generations"
    assert seen["authorization"] == "Bearer test-evolink-key"
    assert seen["payload"] == {
        "model": "seedance-2.0-reference-to-video",
        "prompt": "Make this keyframe into a cinematic MV shot.",
        "image_urls": ["https://image.example/keyframe.png"],
        "audio_urls": ["https://audio.example/music.mp3"],
        "duration": 6,
        "quality": "720p",
        "aspect_ratio": "16:9",
        "generate_audio": True,
    }
    assert result.provider_task_id == "video-task-1"
    assert result.video.url == "https://video.example/evolink.mp4"
    assert result.video.duration_ms == 6000
    assert result.video.width == 1280
    assert result.video.height == 720


def test_evolink_provider_posts_text_payload_and_accepts_task_id_only() -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["payload"] = json.loads(request.content)
        return httpx.Response(200, json={"task_id": "queued-video-task"})

    result = submitEvolinkVideoWithRetry(
        settings=EvolinkVideoProviderSettings(
            base_url="https://api.evolink.ai/v1/videos/generations",
            api_key="test-evolink-key",
            model="seedance-2.0-reference-to-video",
            text_to_video_model="seedance-2.0-text-to-video",
            max_retries=0,
        ),
        prompt="A neon stage camera push.",
        image_urls=[],
        audio_urls=[],
        duration_seconds=8,
        client=httpx.Client(transport=EvolinkVideoTestTransport(handler)),
    )

    assert seen["payload"] == {
        "model": "seedance-2.0-text-to-video",
        "prompt": "A neon stage camera push. Duration: 8 seconds.",
        "duration": 8,
    }
    assert result.provider_task_id == "queued-video-task"
    assert result.video.url is None


def test_evolink_provider_rejects_response_without_video_or_task() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={"data": {}})

    with pytest.raises(ProviderExecutionError, match="video URL or task id"):
        submitEvolinkVideoGenerationOnce(
            settings=EvolinkVideoProviderSettings(
                base_url="https://api.evolink.ai/v1",
                api_key="test-evolink-key",
                model="seedance-2.0-reference-to-video",
                text_to_video_model="seedance-2.0-text-to-video",
            ),
            payload={
                "model": "seedance-2.0-reference-to-video",
                "prompt": "A scene.",
            },
            client=httpx.Client(transport=EvolinkVideoTestTransport(handler)),
        )


def test_evolink_provider_does_not_retry_client_errors() -> None:
    calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        del request
        calls += 1
        return httpx.Response(400, json={"error": "bad request"})

    with pytest.raises(ProviderExecutionError, match="request failed"):
        submitEvolinkVideoWithRetry(
            settings=EvolinkVideoProviderSettings(
                base_url="https://api.evolink.ai/v1",
                api_key="test-evolink-key",
                model="seedance-2.0-reference-to-video",
                text_to_video_model="seedance-2.0-text-to-video",
                max_retries=2,
            ),
            prompt="A scene.",
            image_urls=["https://image.example/keyframe.png"],
            audio_urls=[],
            duration_seconds=5,
            client=httpx.Client(transport=EvolinkVideoTestTransport(handler)),
        )

    assert calls == 1
