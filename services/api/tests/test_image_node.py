from __future__ import annotations

from collections.abc import Callable, Generator
import json

import httpx
import pytest
from fastapi.testclient import TestClient

from xmeta_api.main import app
from xmeta_api.providers import (
    ProviderExecutionError,
    SeedDreamProviderSettings,
    _load_dotenv_values,
    submitSeedreamGenerationOnce,
    submitSeedreamWithRetry,
)
from xmeta_api.schemas import GeneratedImage
from xmeta_api.store import store


client = TestClient(app)


class SeedDreamTestTransport(httpx.BaseTransport):
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
def clean_store_and_seedream_env(
    monkeypatch: pytest.MonkeyPatch,
) -> Generator[None, None, None]:
    store.reset()
    monkeypatch.setenv("X_META_DISABLE_DOTENV", "1")
    _load_dotenv_values.cache_clear()
    for name in (
        "DOUBAO_API_KEY",
        "DOUBAO_BASE_URL",
        "DOUBAO_HTTPS_PROXY",
        "SEEDREAM_MODEL",
        "SEEDREAM_SIZE",
        "SEEDREAM_RESPONSE_FORMAT",
        "SEEDREAM_WATERMARK",
        "SEEDREAM_TIMEOUT_SECONDS",
        "SEEDREAM_MAX_RETRIES",
        "IMAGE_MODEL_PROVIDER",
        "IMAGE_MODEL_BASE_URL",
        "IMAGE_MODEL_API_KEY",
        "IMAGE_MODEL_NAME",
    ):
        monkeypatch.delenv(name, raising=False)
    yield
    _load_dotenv_values.cache_clear()


def image_generation_payload(node_type: str = "character_image") -> dict[str, object]:
    return {
        "node_type": node_type,
        "input": {
            "prompt": "Full-body character reference, soft cinematic lighting.",
        },
    }


def test_generate_image_node_validates_required_prompt() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/character-1/generate-image",
        json={
            "node_type": "character_image",
            "input": {"prompt": ""},
        },
    )

    assert response.status_code == 422


def test_generate_image_node_rejects_video_node_type() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/video-1/generate-image",
        json=image_generation_payload("video"),
    )

    assert response.status_code == 422


def test_generate_image_node_returns_backend_seedream_evidence(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("DOUBAO_API_KEY", "test-doubao-key")
    monkeypatch.setenv("DOUBAO_BASE_URL", "https://ark.cn-beijing.volces.com")
    monkeypatch.setenv("SEEDREAM_MODEL", "doubao-seedream-5-0-260128")
    monkeypatch.setattr(
        "xmeta_api.main.submitSeedreamWithRetry",
        lambda **_: GeneratedImage(
            url="https://image.example/generated.png",
            mime_type="image/png",
            width=1024,
            height=1024,
        ),
    )

    response = client.post(
        "/api/v1/projects/project-1/nodes/character-1/generate-image",
        json=image_generation_payload(),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["image"]["url"] == "https://image.example/generated.png"
    assert body["images"] == [
        {"variant": "character_base", "image": body["image"]},
    ]
    assert body["persisted"] is False


def test_character_derived_images_use_only_the_submitted_base_as_seedream_reference(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls: list[dict[str, object]] = []

    monkeypatch.setenv("DOUBAO_API_KEY", "test-doubao-key")
    monkeypatch.setenv("DOUBAO_BASE_URL", "https://ark.cn-beijing.volces.com")
    monkeypatch.setenv("SEEDREAM_MODEL", "doubao-seedream-5-0-260128")

    def fake_submit_seedream(**kwargs: object) -> GeneratedImage:
        calls.append(kwargs)
        return GeneratedImage(
            url=(
                "https://image.example/character-base.png"
                if len(calls) == 1
                else "https://image.example/character-sheet.png"
            ),
            mime_type="image/png",
            width=1024,
            height=1024,
        )

    monkeypatch.setattr(
        "xmeta_api.main.submitSeedreamWithRetry",
        fake_submit_seedream,
    )
    response = client.post(
        "/api/v1/projects/project-1/nodes/asset-1/generate-character-derived-images",
        json={
            "base_image": {
                "url": "https://image.example/character-base.png",
                "b64_json": "base-image-bytes",
                "mime_type": "image/png",
            },
        },
    )

    assert response.status_code == 200
    assert len(calls) == 2
    assert all(call["reference_image_url"] == "https://image.example/character-base.png" for call in calls)
    assert all(call["reference_image_b64"] == "base-image-bytes" for call in calls)
    assert all(call["reference_image_mime_type"] == "image/png" for call in calls)
    three_view_prompt = str(calls[0]["prompt"])
    for required_phrase in (
        "仅以随附的角色底图作为唯一视觉参考",
        "画面必须且仅包含 3 个等比例、完整全身、标准站姿格位",
        "正面、左侧面、背面",
        "禁止任何文字",
        "严禁出现任何面部表情特写、动态动作、坐姿",
    ):
        assert required_phrase in three_view_prompt
    expression_action_prompt = str(calls[1]["prompt"])
    for required_phrase in (
        "第一横排必须且仅包含 6 个等尺寸面部特写格位",
        "喜悦、悲伤、愤怒、惊讶、恐惧、中性",
        "第二横排必须且仅包含 4 个等比例完整全身动态格位",
        "走路、奔跑、跳跃、坐姿",
        "关节解剖结构正确",
        "重心稳定",
        "明确接触",
        "严禁出现标准三视图",
    ):
        assert required_phrase in expression_action_prompt


def test_character_derived_images_fail_when_required_generation_is_unavailable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("DOUBAO_API_KEY", "test-doubao-key")
    monkeypatch.setenv("DOUBAO_BASE_URL", "https://ark.cn-beijing.volces.com")
    monkeypatch.setenv("SEEDREAM_MODEL", "doubao-seedream-5-0-260128")
    calls = 0

    def fake_submit_seedream(**_: object) -> GeneratedImage:
        nonlocal calls
        calls += 1
        if calls == 2:
            raise ProviderExecutionError("expression/action provider response unavailable")
        return GeneratedImage(url="https://image.example/base.png")

    monkeypatch.setattr(
        "xmeta_api.main.submitSeedreamWithRetry",
        fake_submit_seedream,
    )

    response = client.post(
        "/api/v1/projects/project-1/nodes/character-1/generate-character-derived-images",
        json={"base_image": {"url": "https://image.example/base.png"}},
    )

    assert response.status_code == 502
    assert calls == 2
    assert "expression/action provider response unavailable" in response.json()["detail"]


def test_generate_image_node_fails_clearly_when_seedream_key_missing() -> None:
    response = client.post(
        "/api/v1/projects/project-1/nodes/character-1/generate-image",
        json=image_generation_payload(),
    )

    assert response.status_code == 503
    detail = response.json()["detail"]
    assert "doubao-seedream" in detail
    assert "DOUBAO_API_KEY" in detail
    assert "test-doubao-key" not in detail


def test_seedream_provider_posts_configured_payload_and_reads_url() -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["url"] = str(request.url)
        seen["authorization"] = request.headers["authorization"]
        seen["payload"] = json.loads(request.content)
        return httpx.Response(
            200,
            json={
                "data": [
                    {
                        "url": "https://image.example/seedream.png",
                        "width": 2048,
                        "height": 2048,
                    }
                ]
            },
        )

    image = submitSeedreamWithRetry(
        settings=SeedDreamProviderSettings(
            base_url="https://ark.cn-beijing.volces.com",
            api_key="test-doubao-key",
            model="doubao-seedream-5-0-260128",
            size="2K",
            response_format="url",
            watermark=False,
            max_retries=0,
        ),
        prompt="Generate a prop photo.",
        client=httpx.Client(transport=SeedDreamTestTransport(handler)),
    )

    assert seen["url"] == "https://ark.cn-beijing.volces.com/api/v3/images/generations"
    assert seen["authorization"] == "Bearer test-doubao-key"
    assert seen["payload"] == {
        "model": "doubao-seedream-5-0-260128",
        "prompt": "Generate a prop photo.",
        "size": "2K",
        "response_format": "url",
        "watermark": False,
    }
    assert image.url == "https://image.example/seedream.png"
    assert image.width == 2048
    assert image.height == 2048


def test_seedream_provider_accepts_base64_image_response() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(
            200,
            json={
                "data": [
                    {
                        "b64_json": "iVBORw0KGgo=",
                        "mime_type": "image/png",
                    }
                ]
            },
        )

    image = submitSeedreamGenerationOnce(
        settings=SeedDreamProviderSettings(
            base_url="https://ark.cn-beijing.volces.com/api/v3/images/generations",
            api_key="test-doubao-key",
            model="doubao-seedream-5-0-260128",
        ),
        payload={
            "model": "doubao-seedream-5-0-260128",
            "prompt": "A scene photo.",
        },
        client=httpx.Client(transport=SeedDreamTestTransport(handler)),
    )

    assert image.url is None
    assert image.b64_json == "iVBORw0KGgo="
    assert image.mime_type == "image/png"


def test_seedream_provider_posts_reference_image_payload() -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["payload"] = json.loads(request.content)
        return httpx.Response(
            200,
            json={
                "data": [
                    {
                        "url": "https://image.example/edited.png",
                        "width": 1024,
                        "height": 1024,
                    }
                ]
            },
        )

    image = submitSeedreamWithRetry(
        settings=SeedDreamProviderSettings(
            base_url="https://ark.cn-beijing.volces.com",
            api_key="test-doubao-key",
            model="doubao-seedream-5-0-260128",
            max_retries=0,
        ),
        prompt="Edit this uploaded image.",
        reference_image_b64="old-image",
        reference_image_mime_type="image/jpeg",
        client=httpx.Client(transport=SeedDreamTestTransport(handler)),
    )

    assert seen["payload"] == {
        "model": "doubao-seedream-5-0-260128",
        "prompt": "Edit this uploaded image.",
        "size": "2K",
        "response_format": "url",
        "watermark": False,
        "image": "data:image/jpeg;base64,old-image",
    }
    assert image.url == "https://image.example/edited.png"


def test_seedream_provider_rejects_response_without_image() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={"data": [{}]})

    with pytest.raises(ProviderExecutionError, match="did not include an image"):
        submitSeedreamGenerationOnce(
            settings=SeedDreamProviderSettings(
                base_url="https://ark.cn-beijing.volces.com",
                api_key="test-doubao-key",
                model="doubao-seedream-5-0-260128",
            ),
            payload={
                "model": "doubao-seedream-5-0-260128",
                "prompt": "A scene photo.",
            },
            client=httpx.Client(transport=SeedDreamTestTransport(handler)),
        )


def test_seedream_provider_does_not_retry_client_errors() -> None:
    calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        del request
        calls += 1
        return httpx.Response(400, json={"error": "bad request"})

    with pytest.raises(ProviderExecutionError, match="request failed"):
        submitSeedreamWithRetry(
            settings=SeedDreamProviderSettings(
                base_url="https://ark.cn-beijing.volces.com",
                api_key="test-doubao-key",
                model="doubao-seedream-5-0-260128",
                max_retries=2,
            ),
            prompt="A scene photo.",
            client=httpx.Client(transport=SeedDreamTestTransport(handler)),
        )

    assert calls == 1
