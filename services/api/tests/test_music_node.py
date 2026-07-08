from __future__ import annotations

from collections.abc import Callable, Generator
import json

import httpx
import pytest
from fastapi.testclient import TestClient

from xmeta_api.main import app
from xmeta_api.providers import (
    MiniMaxMusicProviderSettings,
    ProviderExecutionError,
    _load_dotenv_values,
    submitMiniMaxMusicGenerationOnce,
    submitMiniMaxMusicWithRetry,
)
from xmeta_api.schemas import GeneratedAudio
from xmeta_api.store import store


client = TestClient(app)


class MiniMaxMusicTestTransport(httpx.BaseTransport):
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
def clean_store_and_minimax_env(
    monkeypatch: pytest.MonkeyPatch,
) -> Generator[None, None, None]:
    store.reset()
    monkeypatch.setenv("X_META_DISABLE_DOTENV", "1")
    _load_dotenv_values.cache_clear()
    for name in (
        "MINIMAX_API_KEY",
        "MINIMAX_BASE_URL",
        "MINIMAX_HTTPS_PROXY",
        "MINIMAX_MUSIC_MODEL",
        "MINIMAX_MUSIC_OUTPUT_FORMAT",
        "MINIMAX_MUSIC_SAMPLE_RATE",
        "MINIMAX_MUSIC_BITRATE",
        "MINIMAX_MUSIC_FORMAT",
        "MINIMAX_MUSIC_LYRICS_OPTIMIZER",
        "MINIMAX_MUSIC_IS_INSTRUMENTAL",
        "MINIMAX_MUSIC_TIMEOUT_SECONDS",
        "MINIMAX_MUSIC_MAX_RETRIES",
        "MUSIC_MODEL_PROVIDER",
        "MUSIC_MODEL_BASE_URL",
        "MUSIC_MODEL_API_KEY",
        "MUSIC_MODEL_NAME",
    ):
        monkeypatch.delenv(name, raising=False)
    yield
    _load_dotenv_values.cache_clear()


def music_generation_payload() -> dict[str, object]:
    return {
        "node_type": "audio",
        "input": {
            "prompt": "K-pop, cinematic MV chorus, bright synths, 120 BPM",
            "lyrics": "[Verse]\nSnow lights fall around me\n[Chorus]\nWe run into the glow",
        },
    }


def test_generate_audio_node_validates_required_prompt() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/audio-1/generate-audio",
        json={
            "node_type": "audio",
            "input": {"prompt": "", "lyrics": "Valid lyric line"},
        },
    )

    assert response.status_code == 422


def test_generate_audio_node_rejects_video_node_type() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/video-1/generate-audio",
        json={
            "node_type": "video",
            "input": {
                "prompt": "K-pop",
                "lyrics": "Valid lyric line",
            },
        },
    )

    assert response.status_code == 422


def test_generate_audio_node_returns_backend_minimax_evidence(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("MINIMAX_API_KEY", "test-minimax-key")
    monkeypatch.setenv("MINIMAX_BASE_URL", "https://api.minimaxi.com/v1/music_generation")
    monkeypatch.setenv("MINIMAX_MUSIC_MODEL", "music-2.6-free")
    monkeypatch.setattr(
        "xmeta_api.main.submitMiniMaxMusicWithRetry",
        lambda **_: GeneratedAudio(
            url="https://audio.example/generated.mp3",
            mime_type="audio/mpeg",
            duration_ms=25364,
            sample_rate=44100,
            channels=2,
            bitrate=256000,
            size_bytes=813651,
        ),
    )

    response = client.post(
        "/api/v1/projects/project-1/nodes/audio-1/generate-audio",
        json=music_generation_payload(),
    )

    assert response.status_code == 200
    body = response.json()
    assert body == {
        "project_id": "project-1",
        "node_id": "audio-1",
        "node_type": "audio",
        "provider": "minimax",
        "model": "music-2.6-free",
        "prompt": "K-pop, cinematic MV chorus, bright synths, 120 BPM",
        "lyrics": "[Verse]\nSnow lights fall around me\n[Chorus]\nWe run into the glow",
        "audio": {
            "url": "https://audio.example/generated.mp3",
            "hex": None,
            "b64_audio": None,
            "mime_type": "audio/mpeg",
            "duration_ms": 25364,
            "sample_rate": 44100,
            "channels": 2,
            "bitrate": 256000,
            "size_bytes": 813651,
        },
        "persisted": False,
    }


def test_generate_audio_node_passes_reference_audio_to_cover_model(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    seen: dict[str, object] = {}

    monkeypatch.setenv("MINIMAX_API_KEY", "test-minimax-key")
    monkeypatch.setenv("MINIMAX_BASE_URL", "https://api.minimaxi.com/v1/music_generation")
    monkeypatch.setenv("MINIMAX_MUSIC_MODEL", "music-2.6-free")

    def fake_submit(**kwargs: object) -> GeneratedAudio:
        seen.update(kwargs)
        return GeneratedAudio(hex="fffb906400", mime_type="audio/mpeg")

    monkeypatch.setattr("xmeta_api.main.submitMiniMaxMusicWithRetry", fake_submit)

    response = client.post(
        "/api/v1/projects/project-1/nodes/audio-1/generate-audio",
        json={
            "node_type": "audio",
            "input": {
                "prompt": "Make the current track brighter and more cinematic",
                "lyrics": "",
                "reference_audio_b64": "UklGRg==",
                "reference_audio_mime_type": "audio/mpeg",
            },
            "settings": {"model": "music-cover-free"},
        },
    )

    assert response.status_code == 200
    assert seen["prompt"] == "Make the current track brighter and more cinematic"
    assert seen["lyrics"] == ""
    assert seen["reference_audio_b64"] == "UklGRg=="
    settings = seen["settings"]
    assert isinstance(settings, MiniMaxMusicProviderSettings)
    assert settings.model == "music-cover-free"
    assert response.json()["model"] == "music-cover-free"


def test_generate_audio_node_fails_clearly_when_minimax_key_missing() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/audio-1/generate-audio",
        json=music_generation_payload(),
    )

    assert response.status_code == 503
    detail = response.json()["detail"]
    assert "minimax" in detail
    assert "MINIMAX_API_KEY" in detail
    assert "test-minimax-key" not in detail


def test_minimax_provider_posts_configured_payload_and_reads_url() -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["url"] = str(request.url)
        seen["authorization"] = request.headers["authorization"]
        seen["payload"] = json.loads(request.content)
        return httpx.Response(
            200,
            json={
                "data": {
                    "audio": "https://audio.example/minimax.mp3",
                    "status": 2,
                },
                "extra_info": {
                    "music_duration": 25364,
                    "music_sample_rate": 44100,
                    "music_channel": 2,
                    "bitrate": 256000,
                    "music_size": 813651,
                },
                "base_resp": {"status_code": 0, "status_msg": "success"},
            },
        )

    audio = submitMiniMaxMusicWithRetry(
        settings=MiniMaxMusicProviderSettings(
            base_url="https://api.minimaxi.com/v1/music_generation",
            api_key="test-minimax-key",
            model="music-2.6-free",
            output_format="hex",
            sample_rate=44100,
            bitrate=256000,
            audio_format="mp3",
            max_retries=0,
        ),
        prompt="K-pop, bright synths",
        lyrics="[Chorus]\nRun into the glow",
        client=httpx.Client(transport=MiniMaxMusicTestTransport(handler)),
    )

    assert seen["url"] == "https://api.minimaxi.com/v1/music_generation"
    assert seen["authorization"] == "Bearer test-minimax-key"
    assert seen["payload"] == {
        "model": "music-2.6-free",
        "prompt": "K-pop, bright synths",
        "lyrics": "[Chorus]\nRun into the glow",
        "output_format": "hex",
        "audio_setting": {
            "sample_rate": 44100,
            "bitrate": 256000,
            "format": "mp3",
        },
    }
    assert audio.url == "https://audio.example/minimax.mp3"
    assert audio.duration_ms == 25364
    assert audio.sample_rate == 44100
    assert audio.channels == 2
    assert audio.size_bytes == 813651


def test_minimax_provider_posts_cover_reference_audio_without_lyrics() -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["payload"] = json.loads(request.content)
        return httpx.Response(
            200,
            json={
                "data": {
                    "audio": "fffb906400",
                    "status": 2,
                },
                "base_resp": {"status_code": 0, "status_msg": "success"},
            },
        )

    audio = submitMiniMaxMusicWithRetry(
        settings=MiniMaxMusicProviderSettings(
            base_url="https://api.minimaxi.com/v1/music_generation",
            api_key="test-minimax-key",
            model="music-cover-free",
            output_format="hex",
            sample_rate=44100,
            bitrate=256000,
            audio_format="mp3",
            max_retries=0,
        ),
        prompt="Make the current track brighter and more cinematic",
        lyrics="",
        reference_audio_b64="UklGRg==",
        client=httpx.Client(transport=MiniMaxMusicTestTransport(handler)),
    )

    assert seen["payload"] == {
        "model": "music-cover-free",
        "prompt": "Make the current track brighter and more cinematic",
        "output_format": "hex",
        "audio_setting": {
            "sample_rate": 44100,
            "bitrate": 256000,
            "format": "mp3",
        },
        "audio_base64": "UklGRg==",
    }
    assert audio.hex == "fffb906400"


def test_minimax_provider_accepts_hex_audio_response() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(
            200,
            json={
                "data": {
                    "audio": "fffb906400",
                    "status": 2,
                },
                "base_resp": {"status_code": 0, "status_msg": "success"},
            },
        )

    audio = submitMiniMaxMusicGenerationOnce(
        settings=MiniMaxMusicProviderSettings(
            base_url="https://api.minimaxi.com/v1/music_generation",
            api_key="test-minimax-key",
            model="music-2.6-free",
            output_format="hex",
        ),
        payload={
            "model": "music-2.6-free",
            "prompt": "K-pop",
            "lyrics": "Line",
        },
        client=httpx.Client(transport=MiniMaxMusicTestTransport(handler)),
    )

    assert audio.url is None
    assert audio.hex == "fffb906400"
    assert audio.mime_type == "audio/mpeg"


def test_minimax_provider_rejects_response_without_audio() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(
            200,
            json={"data": {}, "base_resp": {"status_code": 0, "status_msg": "success"}},
        )

    with pytest.raises(ProviderExecutionError, match="did not include audio"):
        submitMiniMaxMusicGenerationOnce(
            settings=MiniMaxMusicProviderSettings(
                base_url="https://api.minimaxi.com/v1/music_generation",
                api_key="test-minimax-key",
                model="music-2.6-free",
            ),
            payload={
                "model": "music-2.6-free",
                "prompt": "K-pop",
                "lyrics": "Line",
            },
            client=httpx.Client(transport=MiniMaxMusicTestTransport(handler)),
        )


def test_minimax_provider_does_not_retry_client_errors() -> None:
    calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        del request
        calls += 1
        return httpx.Response(400, json={"error": "bad request"})

    with pytest.raises(ProviderExecutionError, match="request failed"):
        submitMiniMaxMusicWithRetry(
            settings=MiniMaxMusicProviderSettings(
                base_url="https://api.minimaxi.com/v1/music_generation",
                api_key="test-minimax-key",
                model="music-2.6-free",
                max_retries=2,
            ),
            prompt="K-pop",
            lyrics="Line",
            client=httpx.Client(transport=MiniMaxMusicTestTransport(handler)),
        )

    assert calls == 1
