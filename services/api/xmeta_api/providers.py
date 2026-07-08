from __future__ import annotations

import json
import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Protocol

import httpx
from pydantic import ValidationError

from .schemas import (
    GeneratedAudio,
    GeneratedImage,
    GeneratedVideo,
    ImageGenerationSettings,
    MusicGenerationSettings,
    ScriptDialogueMessage,
    ScriptInput,
    ScriptOutput,
    VideoGenerationSettings,
)


class ProviderConfigurationError(RuntimeError):
    pass


class ProviderExecutionError(RuntimeError):
    pass


class ScriptProvider(Protocol):
    name: str

    def generate(self, script_input: ScriptInput, prompt: str) -> ScriptOutput:
        raise NotImplementedError

    def chat(
        self,
        script_input: ScriptInput,
        history: list[ScriptDialogueMessage],
        user_message: str,
        prompt: str,
    ) -> str:
        raise NotImplementedError


SUPPORTED_TEXT_PROVIDERS = {"openai", "openai-compatible"}
SUPPORTED_IMAGE_PROVIDERS = {"doubao-seedream"}
SUPPORTED_MUSIC_PROVIDERS = {"minimax"}
SUPPORTED_VIDEO_PROVIDERS = {"evolink", "evolink-seedance"}


@dataclass(frozen=True)
class ScriptProviderSettings:
    provider: str = "openai"
    base_url: str | None = None
    api_key: str | None = None
    model: str | None = None
    temperature: float | None = None
    timeout_seconds: int = 60
    max_retries: int = 1

    @classmethod
    def from_env(cls) -> "ScriptProviderSettings":
        provider = _first_env("TEXT_MODEL_PROVIDER", "SCRIPT_MODEL_PROVIDER", default="openai")
        normalized_provider = provider.strip().lower() or "openai"
        default_model = "gpt-5.4-mini"
        temperature = _first_env("TEXT_MODEL_TEMPERATURE", "SCRIPT_MODEL_TEMPERATURE")
        return cls(
            provider=normalized_provider,
            base_url=_first_env(
                "TEXT_MODEL_BASE_URL",
                "SCRIPT_MODEL_BASE_URL",
                "OPENAI_BASE_URL",
                default="https://api.openai.com/v1",
            ),
            api_key=_first_env(
                "TEXT_MODEL_API_KEY",
                "SCRIPT_MODEL_API_KEY",
                "OPENAI_API_KEY",
            ),
            model=_first_env("TEXT_MODEL_NAME", "SCRIPT_MODEL_NAME", default=default_model),
            temperature=_parse_optional_float("TEXT_MODEL_TEMPERATURE", temperature),
            timeout_seconds=_parse_int(
                "TEXT_MODEL_TIMEOUT_SECONDS",
                _first_env("TEXT_MODEL_TIMEOUT_SECONDS", "SCRIPT_MODEL_TIMEOUT_SECONDS")
                or "60",
            ),
            max_retries=_parse_int(
                "TEXT_MODEL_MAX_RETRIES",
                _first_env("TEXT_MODEL_MAX_RETRIES", "SCRIPT_MODEL_MAX_RETRIES") or "1",
            ),
        )

    def validate(self) -> None:
        if self.provider not in SUPPORTED_TEXT_PROVIDERS:
            allowed = ", ".join(sorted(SUPPORTED_TEXT_PROVIDERS))
            raise ProviderConfigurationError(
                f"Text model provider '{self.provider}' is not supported. "
                f"Allowed providers: {allowed}."
            )

        missing = [
            env_name
            for env_name, value in (
                ("TEXT_MODEL_BASE_URL", self.base_url),
                ("TEXT_MODEL_API_KEY or OPENAI_API_KEY", self.api_key),
                ("TEXT_MODEL_NAME", self.model),
            )
            if not value
        ]
        if missing:
            joined = ", ".join(missing)
            raise ProviderConfigurationError(
                f"Text model provider '{self.provider}' requires missing config: {joined}."
            )


@dataclass(frozen=True)
class SeedDreamProviderSettings:
    provider: str = "doubao-seedream"
    base_url: str | None = None
    api_key: str | None = None
    model: str | None = None
    size: str = "2K"
    response_format: str = "url"
    watermark: bool = False
    timeout_seconds: int = 120
    max_retries: int = 1
    https_proxy: str | None = None

    @classmethod
    def from_env(cls) -> "SeedDreamProviderSettings":
        provider = _first_env("IMAGE_MODEL_PROVIDER", default="doubao-seedream")
        return cls(
            provider=(provider or "doubao-seedream").strip().lower(),
            base_url=_first_env(
                "DOUBAO_BASE_URL",
                "IMAGE_MODEL_BASE_URL",
                default="https://ark.cn-beijing.volces.com",
            ),
            api_key=_first_env("DOUBAO_API_KEY", "IMAGE_MODEL_API_KEY"),
            model=_first_env(
                "SEEDREAM_MODEL",
                "IMAGE_MODEL_NAME",
                default="doubao-seedream-5-0-260128",
            ),
            size=_first_env("SEEDREAM_SIZE", default="2K") or "2K",
            response_format=_first_env("SEEDREAM_RESPONSE_FORMAT", default="url")
            or "url",
            watermark=_parse_bool(
                "SEEDREAM_WATERMARK",
                _first_env("SEEDREAM_WATERMARK", default="false") or "false",
            ),
            timeout_seconds=_parse_int(
                "SEEDREAM_TIMEOUT_SECONDS",
                _first_env("SEEDREAM_TIMEOUT_SECONDS") or "120",
            ),
            max_retries=_parse_int(
                "SEEDREAM_MAX_RETRIES",
                _first_env("SEEDREAM_MAX_RETRIES") or "1",
            ),
            https_proxy=_first_env("DOUBAO_HTTPS_PROXY"),
        )

    def with_overrides(
        self,
        settings: ImageGenerationSettings,
    ) -> "SeedDreamProviderSettings":
        provider = (
            settings.provider.strip().lower()
            if settings.provider and settings.provider.strip()
            else self.provider
        )
        model = (
            settings.model.strip()
            if settings.model and settings.model.strip()
            else self.model
        )
        size = settings.size.strip() if settings.size and settings.size.strip() else self.size
        response_format = (
            settings.response_format.strip()
            if settings.response_format and settings.response_format.strip()
            else self.response_format
        )
        watermark = settings.watermark if settings.watermark is not None else self.watermark

        return SeedDreamProviderSettings(
            provider=provider,
            base_url=self.base_url,
            api_key=self.api_key,
            model=model,
            size=size,
            response_format=response_format,
            watermark=watermark,
            timeout_seconds=self.timeout_seconds,
            max_retries=self.max_retries,
            https_proxy=self.https_proxy,
        )

    def validate(self) -> None:
        if self.provider not in SUPPORTED_IMAGE_PROVIDERS:
            allowed = ", ".join(sorted(SUPPORTED_IMAGE_PROVIDERS))
            raise ProviderConfigurationError(
                f"Image model provider '{self.provider}' is not supported. "
                f"Allowed providers: {allowed}."
            )

        if self.response_format not in {"url", "b64_json"}:
            raise ProviderConfigurationError(
                "SEEDREAM_RESPONSE_FORMAT must be url or b64_json."
            )

        missing = [
            env_name
            for env_name, value in (
                ("DOUBAO_BASE_URL", self.base_url),
                ("DOUBAO_API_KEY", self.api_key),
                ("SEEDREAM_MODEL", self.model),
            )
            if not value
        ]
        if missing:
            joined = ", ".join(missing)
            raise ProviderConfigurationError(
                f"Image model provider '{self.provider}' requires missing config: {joined}."
            )


@dataclass(frozen=True)
class MiniMaxMusicProviderSettings:
    provider: str = "minimax"
    base_url: str | None = None
    api_key: str | None = None
    model: str | None = None
    output_format: str = "url"
    sample_rate: int = 44100
    bitrate: int = 256000
    audio_format: str = "mp3"
    lyrics_optimizer: bool = False
    is_instrumental: bool = False
    timeout_seconds: int = 180
    max_retries: int = 1
    https_proxy: str | None = None

    @classmethod
    def from_env(cls) -> "MiniMaxMusicProviderSettings":
        return cls(
            provider=_first_env("MUSIC_MODEL_PROVIDER", default="minimax") or "minimax",
            base_url=_first_env(
                "MINIMAX_BASE_URL",
                "MUSIC_MODEL_BASE_URL",
                default="https://api.minimax.io",
            ),
            api_key=_first_env("MINIMAX_API_KEY", "MUSIC_MODEL_API_KEY"),
            model=_first_env(
                "MINIMAX_MUSIC_MODEL",
                "MUSIC_MODEL_NAME",
                default="music-2.6-free",
            ),
            output_format=_first_env("MINIMAX_MUSIC_OUTPUT_FORMAT", default="url") or "url",
            sample_rate=_parse_int(
                "MINIMAX_MUSIC_SAMPLE_RATE",
                _first_env("MINIMAX_MUSIC_SAMPLE_RATE") or "44100",
            ),
            bitrate=_parse_int(
                "MINIMAX_MUSIC_BITRATE",
                _first_env("MINIMAX_MUSIC_BITRATE") or "256000",
            ),
            audio_format=_first_env("MINIMAX_MUSIC_FORMAT", default="mp3") or "mp3",
            lyrics_optimizer=_parse_bool(
                "MINIMAX_MUSIC_LYRICS_OPTIMIZER",
                _first_env("MINIMAX_MUSIC_LYRICS_OPTIMIZER", default="false")
                or "false",
            ),
            is_instrumental=_parse_bool(
                "MINIMAX_MUSIC_IS_INSTRUMENTAL",
                _first_env("MINIMAX_MUSIC_IS_INSTRUMENTAL", default="false") or "false",
            ),
            timeout_seconds=_parse_int(
                "MINIMAX_MUSIC_TIMEOUT_SECONDS",
                _first_env("MINIMAX_MUSIC_TIMEOUT_SECONDS") or "180",
            ),
            max_retries=_parse_int(
                "MINIMAX_MUSIC_MAX_RETRIES",
                _first_env("MINIMAX_MUSIC_MAX_RETRIES") or "1",
            ),
            https_proxy=_first_env("MINIMAX_HTTPS_PROXY"),
        )

    def with_overrides(
        self,
        settings: MusicGenerationSettings,
    ) -> "MiniMaxMusicProviderSettings":
        provider = (
            settings.provider.strip().lower()
            if settings.provider and settings.provider.strip()
            else self.provider
        )
        model = settings.model.strip() if settings.model and settings.model.strip() else self.model
        output_format = (
            settings.output_format.strip()
            if settings.output_format and settings.output_format.strip()
            else self.output_format
        )
        audio_format = (
            settings.format.strip()
            if settings.format and settings.format.strip()
            else self.audio_format
        )

        return MiniMaxMusicProviderSettings(
            provider=provider,
            base_url=self.base_url,
            api_key=self.api_key,
            model=model,
            output_format=output_format,
            sample_rate=settings.sample_rate or self.sample_rate,
            bitrate=settings.bitrate or self.bitrate,
            audio_format=audio_format,
            lyrics_optimizer=(
                settings.lyrics_optimizer
                if settings.lyrics_optimizer is not None
                else self.lyrics_optimizer
            ),
            is_instrumental=(
                settings.is_instrumental
                if settings.is_instrumental is not None
                else self.is_instrumental
            ),
            timeout_seconds=self.timeout_seconds,
            max_retries=self.max_retries,
            https_proxy=self.https_proxy,
        )

    def validate(self) -> None:
        if self.provider not in SUPPORTED_MUSIC_PROVIDERS:
            allowed = ", ".join(sorted(SUPPORTED_MUSIC_PROVIDERS))
            raise ProviderConfigurationError(
                f"Music model provider '{self.provider}' is not supported. "
                f"Allowed providers: {allowed}."
            )

        if self.output_format not in {"url", "hex"}:
            raise ProviderConfigurationError("MINIMAX_MUSIC_OUTPUT_FORMAT must be url or hex.")

        if self.audio_format not in {"mp3", "wav", "flac"}:
            raise ProviderConfigurationError("MINIMAX_MUSIC_FORMAT must be mp3, wav, or flac.")

        missing = [
            env_name
            for env_name, value in (
                ("MINIMAX_BASE_URL", self.base_url),
                ("MINIMAX_API_KEY", self.api_key),
                ("MINIMAX_MUSIC_MODEL", self.model),
            )
            if not value
        ]
        if missing:
            joined = ", ".join(missing)
            raise ProviderConfigurationError(
                f"Music model provider '{self.provider}' requires missing config: {joined}."
            )


@dataclass(frozen=True)
class VideoGenerationProviderResult:
    video: GeneratedVideo
    provider_task_id: str | None = None


@dataclass(frozen=True)
class EvolinkVideoProviderSettings:
    provider: str = "evolink"
    base_url: str | None = None
    api_key: str | None = None
    model: str | None = None
    text_to_video_model: str | None = None
    quality: str = "720p"
    aspect_ratio: str = "16:9"
    generate_audio: bool = True
    timeout_seconds: int = 240
    max_retries: int = 1

    @classmethod
    def from_env(cls) -> "EvolinkVideoProviderSettings":
        provider = _first_env("VIDEO_MODEL_PROVIDER", default="evolink")
        return cls(
            provider=(provider or "evolink").strip().lower(),
            base_url=_first_env(
                "EVOLINK_BASE_URL",
                "VIDEO_MODEL_BASE_URL",
                default="https://api.evolink.ai/v1",
            ),
            api_key=_first_env("EVOLINK_API_KEY", "VIDEO_MODEL_API_KEY"),
            model=_first_env(
                "EVOLINK_VIDEO_MODEL",
                "VIDEO_MODEL_NAME",
                default="seedance-2.0-reference-to-video",
            ),
            text_to_video_model=_first_env(
                "EVOLINK_TEXT_TO_VIDEO_MODEL",
                default="seedance-2.0-text-to-video",
            ),
            quality=_first_env("EVOLINK_VIDEO_QUALITY", default="720p") or "720p",
            aspect_ratio=_first_env("EVOLINK_VIDEO_ASPECT_RATIO", default="16:9")
            or "16:9",
            generate_audio=_parse_bool(
                "EVOLINK_GENERATE_AUDIO",
                _first_env("EVOLINK_GENERATE_AUDIO", default="true") or "true",
            ),
            timeout_seconds=_parse_int(
                "EVOLINK_VIDEO_TIMEOUT_SECONDS",
                _first_env("EVOLINK_VIDEO_TIMEOUT_SECONDS") or "240",
            ),
            max_retries=_parse_int(
                "EVOLINK_VIDEO_MAX_RETRIES",
                _first_env("EVOLINK_VIDEO_MAX_RETRIES") or "1",
            ),
        )

    def with_overrides(
        self,
        settings: VideoGenerationSettings,
    ) -> "EvolinkVideoProviderSettings":
        provider = (
            settings.provider.strip().lower()
            if settings.provider and settings.provider.strip()
            else self.provider
        )
        model = settings.model.strip() if settings.model and settings.model.strip() else self.model
        text_to_video_model = (
            settings.text_to_video_model.strip()
            if settings.text_to_video_model and settings.text_to_video_model.strip()
            else self.text_to_video_model
        )
        quality = (
            settings.quality.strip()
            if settings.quality and settings.quality.strip()
            else self.quality
        )
        aspect_ratio = (
            settings.aspect_ratio.strip()
            if settings.aspect_ratio and settings.aspect_ratio.strip()
            else self.aspect_ratio
        )

        return EvolinkVideoProviderSettings(
            provider=provider,
            base_url=self.base_url,
            api_key=self.api_key,
            model=model,
            text_to_video_model=text_to_video_model,
            quality=quality,
            aspect_ratio=aspect_ratio,
            generate_audio=(
                settings.generate_audio
                if settings.generate_audio is not None
                else self.generate_audio
            ),
            timeout_seconds=self.timeout_seconds,
            max_retries=self.max_retries,
        )

    def model_for_generation(self, *, has_images: bool) -> str:
        model = self.model if has_images else self.text_to_video_model
        assert model is not None
        return model

    def validate(self) -> None:
        if self.provider not in SUPPORTED_VIDEO_PROVIDERS:
            allowed = ", ".join(sorted(SUPPORTED_VIDEO_PROVIDERS))
            raise ProviderConfigurationError(
                f"Video model provider '{self.provider}' is not supported. "
                f"Allowed providers: {allowed}."
            )

        missing = [
            env_name
            for env_name, value in (
                ("EVOLINK_BASE_URL", self.base_url),
                ("EVOLINK_API_KEY", self.api_key),
                ("EVOLINK_VIDEO_MODEL", self.model),
                ("EVOLINK_TEXT_TO_VIDEO_MODEL", self.text_to_video_model),
            )
            if not value
        ]
        if missing:
            joined = ", ".join(missing)
            raise ProviderConfigurationError(
                f"Video model provider '{self.provider}' requires missing config: {joined}."
            )


class OpenAICompatibleScriptProvider:
    def __init__(
        self,
        settings: ScriptProviderSettings,
        client: httpx.Client | None = None,
    ) -> None:
        self.name = settings.provider
        self._settings = settings
        self._client = client

    def generate(self, script_input: ScriptInput, prompt: str) -> ScriptOutput:
        del script_input
        self._settings.validate()

        payload: dict[str, object] = {
            "model": self._settings.model,
            "input": prompt,
        }
        if self._settings.temperature is not None:
            payload["temperature"] = self._settings.temperature

        response_data = self._post_response(payload)
        response_text = _strip_json_fence(_extract_response_text(response_data))
        try:
            output = ScriptOutput.model_validate(json.loads(response_text))
            if output.agent_output and output.agent_output.strip():
                return output
            return output.model_copy(update={"agent_output": response_text})
        except json.JSONDecodeError as exc:
            raise ProviderExecutionError("Text model returned invalid JSON.") from exc
        except ValidationError as exc:
            raise ProviderExecutionError(
                "Text model returned JSON that does not match ScriptOutput."
            ) from exc

    def chat(
        self,
        script_input: ScriptInput,
        history: list[ScriptDialogueMessage],
        user_message: str,
        prompt: str,
    ) -> str:
        del script_input, history, user_message
        self._settings.validate()

        payload: dict[str, object] = {
            "model": self._settings.model,
            "input": prompt,
        }
        if self._settings.temperature is not None:
            payload["temperature"] = self._settings.temperature

        return _extract_response_text(self._post_response(payload)).strip()

    def _post_response(self, payload: dict[str, object]) -> dict[str, Any]:
        assert self._settings.base_url is not None
        assert self._settings.api_key is not None

        url = f"{self._settings.base_url.rstrip('/')}/responses"
        headers = {
            "Authorization": f"Bearer {self._settings.api_key}",
            "Content-Type": "application/json",
        }
        attempts = max(0, self._settings.max_retries) + 1

        last_error: Exception | None = None
        for _ in range(attempts):
            try:
                if self._client is not None:
                    response = self._client.post(url, headers=headers, json=payload)
                else:
                    with httpx.Client(timeout=self._settings.timeout_seconds) as client:
                        response = client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as exc:
                last_error = exc
                if 400 <= exc.response.status_code < 500:
                    break
            except httpx.HTTPError as exc:
                last_error = exc

        raise ProviderExecutionError("Text model request failed.") from last_error


def submitSeedreamWithRetry(
    *,
    settings: SeedDreamProviderSettings,
    prompt: str,
    reference_image_url: str | None = None,
    reference_image_b64: str | None = None,
    reference_image_mime_type: str | None = None,
    client: httpx.Client | None = None,
) -> GeneratedImage:
    settings.validate()
    payload: dict[str, object] = {
        "model": settings.model,
        "prompt": prompt,
        "size": settings.size,
        "response_format": settings.response_format,
        "watermark": settings.watermark,
        "stream": False,
    }
    reference_image = _build_seedream_reference_image(
        url=reference_image_url,
        b64_json=reference_image_b64,
        mime_type=reference_image_mime_type,
    )
    if reference_image:
        payload["image"] = reference_image
    attempts = max(0, settings.max_retries) + 1
    last_error: Exception | None = None

    for attempt in range(attempts):
        try:
            return submitSeedreamGenerationOnce(
                settings=settings,
                payload=payload,
                client=client,
            )
        except ProviderExecutionError as exc:
            last_error = exc
            retryable = getattr(exc, "retryable", True)
            if not retryable or attempt == attempts - 1:
                break

    raise ProviderExecutionError("SeedDream image generation request failed.") from last_error


def submitSeedreamGenerationOnce(
    *,
    settings: SeedDreamProviderSettings,
    payload: dict[str, object],
    client: httpx.Client | None = None,
) -> GeneratedImage:
    settings.validate()
    assert settings.api_key is not None

    url = _seedream_generation_url(settings.base_url)
    headers = {
        "Authorization": f"Bearer {settings.api_key}",
        "Content-Type": "application/json",
    }

    try:
        if client is not None:
            response = client.post(url, headers=headers, json=payload)
        else:
            with httpx.Client(
                timeout=settings.timeout_seconds,
                proxy=settings.https_proxy,
            ) as seedream_client:
                response = seedream_client.post(url, headers=headers, json=payload)
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        error = ProviderExecutionError("SeedDream image generation request failed.")
        error.retryable = exc.response.status_code >= 500  # type: ignore[attr-defined]
        raise error from exc
    except httpx.HTTPError as exc:
        error = ProviderExecutionError("SeedDream image generation request failed.")
        error.retryable = True  # type: ignore[attr-defined]
        raise error from exc

    return _extract_seedream_image(response.json())


def submitMiniMaxMusicWithRetry(
    *,
    settings: MiniMaxMusicProviderSettings,
    prompt: str,
    lyrics: str,
    client: httpx.Client | None = None,
) -> GeneratedAudio:
    settings.validate()
    if not settings.is_instrumental and not lyrics.strip() and not settings.lyrics_optimizer:
        raise ProviderConfigurationError(
            "Music generation requires lyrics unless instrumental mode or lyrics optimizer is enabled."
        )

    payload: dict[str, object] = {
        "model": settings.model,
        "prompt": prompt,
        "lyrics": lyrics,
        "stream": False,
        "output_format": settings.output_format,
        "audio_setting": {
            "sample_rate": settings.sample_rate,
            "bitrate": settings.bitrate,
            "format": settings.audio_format,
        },
        "lyrics_optimizer": settings.lyrics_optimizer,
        "is_instrumental": settings.is_instrumental,
    }
    attempts = max(0, settings.max_retries) + 1
    last_error: Exception | None = None

    for attempt in range(attempts):
        try:
            return submitMiniMaxMusicGenerationOnce(
                settings=settings,
                payload=payload,
                client=client,
            )
        except ProviderExecutionError as exc:
            last_error = exc
            retryable = getattr(exc, "retryable", True)
            if not retryable or attempt == attempts - 1:
                break

    raise ProviderExecutionError("MiniMax music generation request failed.") from last_error


def submitMiniMaxMusicGenerationOnce(
    *,
    settings: MiniMaxMusicProviderSettings,
    payload: dict[str, object],
    client: httpx.Client | None = None,
) -> GeneratedAudio:
    settings.validate()
    assert settings.api_key is not None

    url = _minimax_music_generation_url(settings.base_url)
    headers = {
        "Authorization": f"Bearer {settings.api_key}",
        "Content-Type": "application/json",
    }

    try:
        if client is not None:
            response = client.post(url, headers=headers, json=payload)
        else:
            with httpx.Client(
                timeout=settings.timeout_seconds,
                proxy=settings.https_proxy,
            ) as minimax_client:
                response = minimax_client.post(url, headers=headers, json=payload)
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        error = ProviderExecutionError("MiniMax music generation request failed.")
        error.retryable = exc.response.status_code >= 500  # type: ignore[attr-defined]
        raise error from exc
    except httpx.HTTPError as exc:
        error = ProviderExecutionError("MiniMax music generation request failed.")
        error.retryable = True  # type: ignore[attr-defined]
        raise error from exc

    return _extract_minimax_audio(response.json(), settings=settings)


def submitEvolinkVideoWithRetry(
    *,
    settings: EvolinkVideoProviderSettings,
    prompt: str,
    image_urls: list[str],
    audio_urls: list[str],
    duration_seconds: int,
    client: httpx.Client | None = None,
) -> VideoGenerationProviderResult:
    settings.validate()
    payload = _build_evolink_video_payload(
        settings=settings,
        prompt=prompt,
        image_urls=image_urls,
        audio_urls=audio_urls,
        duration_seconds=duration_seconds,
    )
    attempts = max(0, settings.max_retries) + 1
    last_error: Exception | None = None

    for attempt in range(attempts):
        try:
            return submitEvolinkVideoGenerationOnce(
                settings=settings,
                payload=payload,
                client=client,
            )
        except ProviderExecutionError as exc:
            last_error = exc
            retryable = getattr(exc, "retryable", True)
            if not retryable or attempt == attempts - 1:
                break

    raise ProviderExecutionError("Evolink video generation request failed.") from last_error


def submitEvolinkVideoGenerationOnce(
    *,
    settings: EvolinkVideoProviderSettings,
    payload: dict[str, object],
    client: httpx.Client | None = None,
) -> VideoGenerationProviderResult:
    settings.validate()
    assert settings.api_key is not None

    url = _evolink_video_generation_url(settings.base_url)
    headers = {
        "Authorization": f"Bearer {settings.api_key}",
        "Content-Type": "application/json",
    }

    try:
        if client is not None:
            response = client.post(url, headers=headers, json=payload)
        else:
            with httpx.Client(timeout=settings.timeout_seconds) as evolink_client:
                response = evolink_client.post(url, headers=headers, json=payload)
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        error = ProviderExecutionError("Evolink video generation request failed.")
        error.retryable = exc.response.status_code >= 500  # type: ignore[attr-defined]
        raise error from exc
    except httpx.HTTPError as exc:
        error = ProviderExecutionError("Evolink video generation request failed.")
        error.retryable = True  # type: ignore[attr-defined]
        raise error from exc

    return _extract_evolink_video(response.json())


def _build_evolink_video_payload(
    *,
    settings: EvolinkVideoProviderSettings,
    prompt: str,
    image_urls: list[str],
    audio_urls: list[str],
    duration_seconds: int,
) -> dict[str, object]:
    if image_urls:
        payload: dict[str, object] = {
            "model": settings.model_for_generation(has_images=True),
            "prompt": prompt,
            "image_urls": image_urls,
            "duration": duration_seconds,
            "quality": settings.quality,
            "aspect_ratio": settings.aspect_ratio,
            "generate_audio": settings.generate_audio,
        }
        if audio_urls:
            payload["audio_urls"] = audio_urls
        return payload

    return {
        "model": settings.model_for_generation(has_images=False),
        "prompt": _prompt_with_duration(prompt, duration_seconds),
        "duration": duration_seconds,
    }


def _first_env(*names: str, default: str | None = None) -> str | None:
    dotenv_values = _load_dotenv_values()
    for name in names:
        value = os.getenv(name)
        if value is not None and value.strip():
            return value.strip()
        dotenv_value = dotenv_values.get(name)
        if dotenv_value is not None and dotenv_value.strip():
            return dotenv_value.strip()
    return default


@lru_cache(maxsize=1)
def _load_dotenv_values() -> dict[str, str]:
    if os.getenv("X_META_DISABLE_DOTENV") == "1":
        return {}

    values: dict[str, str] = {}
    repo_root = Path(__file__).resolve().parents[3]
    for path in (
        repo_root / ".env",
        repo_root / "services" / "api" / ".env",
        repo_root / ".env.example",
    ):
        if not path.exists() or not path.is_file():
            continue
        for raw_line in path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            if key.startswith("export "):
                key = key.removeprefix("export ").strip()
            if not key:
                continue
            value = value.strip()
            if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
                value = value[1:-1]
            values.setdefault(key, value)
    return values


def _parse_optional_float(env_name: str, value: str | None) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except ValueError as exc:
        raise ProviderConfigurationError(f"{env_name} must be a number.") from exc


def _parse_int(env_name: str, value: str) -> int:
    try:
        return int(value)
    except ValueError as exc:
        raise ProviderConfigurationError(f"{env_name} must be an integer.") from exc


def _parse_bool(env_name: str, value: str) -> bool:
    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    raise ProviderConfigurationError(f"{env_name} must be a boolean.")


def _strip_json_fence(text: str) -> str:
    stripped = text.strip()
    if not stripped.startswith("```"):
        return stripped

    lines = stripped.splitlines()
    if len(lines) >= 3 and lines[0].strip().lower() in {"```", "```json"}:
        return "\n".join(lines[1:-1]).strip()
    return stripped


def _extract_response_text(response_data: dict[str, Any]) -> str:
    output_text = response_data.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text

    output = response_data.get("output", [])
    if isinstance(output, list):
        for item in output:
            if not isinstance(item, dict):
                continue
            content = item.get("content", [])
            if not isinstance(content, list):
                continue
            for content_item in content:
                if isinstance(content_item, dict):
                    text = content_item.get("text")
                    if isinstance(text, str) and text.strip():
                        return text

    raise ProviderExecutionError("Text model response did not include output text.")


def _seedream_generation_url(base_url: str | None) -> str:
    assert base_url is not None
    normalized = base_url.rstrip("/")
    if normalized.endswith("/images/generations"):
        return normalized
    if normalized.endswith("/api/v3"):
        return f"{normalized}/images/generations"
    return f"{normalized}/api/v3/images/generations"


def _build_seedream_reference_image(
    *,
    url: str | None,
    b64_json: str | None,
    mime_type: str | None,
) -> str | None:
    if url and url.strip():
        return url.strip()

    if not b64_json or not b64_json.strip():
        return None

    image_data = b64_json.strip()
    if image_data.startswith("data:image/"):
        return image_data

    image_mime_type = (mime_type or "image/png").strip() or "image/png"
    return f"data:{image_mime_type};base64,{image_data}"


def _extract_seedream_image(response_data: dict[str, Any]) -> GeneratedImage:
    data = response_data.get("data")
    candidates: list[dict[str, Any]] = []
    if isinstance(data, list):
        candidates.extend(item for item in data if isinstance(item, dict))

    image = response_data.get("image")
    if not candidates and isinstance(image, dict):
        candidates.append(image)

    images = response_data.get("images")
    if not candidates and isinstance(images, list):
        candidates.extend(item for item in images if isinstance(item, dict))

    for candidate in candidates:
        url = _string_or_none(
            candidate.get("url")
            or candidate.get("image_url")
            or candidate.get("imageUrl")
        )
        b64_json = _string_or_none(
            candidate.get("b64_json")
            or candidate.get("base64")
            or candidate.get("image_base64")
        )
        mime_type = _string_or_none(
            candidate.get("mime_type") or candidate.get("mimeType")
        )
        if not mime_type and b64_json and b64_json.startswith("data:image/"):
            mime_type = b64_json.split(";", 1)[0].removeprefix("data:")
        if url or b64_json:
            return GeneratedImage(
                url=url,
                b64_json=b64_json,
                mime_type=mime_type,
                width=_int_or_none(candidate.get("width")),
                height=_int_or_none(candidate.get("height")),
            )

    raise ProviderExecutionError("SeedDream response did not include an image.")


def _minimax_music_generation_url(base_url: str | None) -> str:
    assert base_url is not None
    normalized = base_url.rstrip("/")
    if normalized.endswith("/music_generation"):
        return normalized
    if normalized.endswith("/v1"):
        return f"{normalized}/music_generation"
    return f"{normalized}/v1/music_generation"


def _evolink_video_generation_url(base_url: str | None) -> str:
    assert base_url is not None
    normalized = base_url.rstrip("/")
    if normalized.endswith("/videos/generations"):
        return normalized
    return f"{normalized}/videos/generations"


def _extract_minimax_audio(
    response_data: dict[str, Any],
    *,
    settings: MiniMaxMusicProviderSettings,
) -> GeneratedAudio:
    base_resp = response_data.get("base_resp")
    if isinstance(base_resp, dict):
        status_code = base_resp.get("status_code")
        if isinstance(status_code, int) and status_code != 0:
            status_msg = _string_or_none(base_resp.get("status_msg")) or "unknown error"
            raise ProviderExecutionError(f"MiniMax music generation failed: {status_msg}")

    data = response_data.get("data")
    data_dict = data if isinstance(data, dict) else {}
    audio_value = _string_or_none(data_dict.get("audio"))
    url = _string_or_none(
        data_dict.get("audio_url")
        or data_dict.get("url")
        or data_dict.get("download_url")
    )
    hex_audio: str | None = None
    b64_audio = _string_or_none(
        data_dict.get("b64_audio")
        or data_dict.get("audio_base64")
        or data_dict.get("base64")
    )

    if audio_value:
        if audio_value.startswith(("http://", "https://", "data:audio/")):
            url = audio_value
        elif settings.output_format == "hex" or _looks_like_hex(audio_value):
            hex_audio = audio_value
        else:
            b64_audio = audio_value

    extra_info = response_data.get("extra_info")
    extra_dict = extra_info if isinstance(extra_info, dict) else {}
    mime_type = _string_or_none(data_dict.get("mime_type") or data_dict.get("mimeType"))
    if mime_type is None:
        mime_type = _audio_mime_type(settings.audio_format)

    if not (url or hex_audio or b64_audio):
        raise ProviderExecutionError("MiniMax response did not include audio.")

    return GeneratedAudio(
        url=url,
        hex=hex_audio,
        b64_audio=b64_audio,
        mime_type=mime_type,
        duration_ms=_int_or_none(
            extra_dict.get("music_duration") or data_dict.get("duration_ms")
        ),
        sample_rate=_int_or_none(
            extra_dict.get("music_sample_rate") or data_dict.get("sample_rate")
        ),
        channels=_int_or_none(
            extra_dict.get("music_channel") or data_dict.get("channels")
        ),
        bitrate=_int_or_none(extra_dict.get("bitrate") or data_dict.get("bitrate")),
        size_bytes=_int_or_none(
            extra_dict.get("music_size") or data_dict.get("size_bytes")
        ),
    )


def _extract_evolink_video(response_data: dict[str, Any]) -> VideoGenerationProviderResult:
    _raise_evolink_response_error(response_data)
    provider_task_id = _find_provider_task_id(response_data)

    for candidate in _nested_dict_candidates(response_data):
        url = _string_or_none(
            candidate.get("video_url")
            or candidate.get("videoUrl")
            or candidate.get("download_url")
            or candidate.get("downloadUrl")
            or candidate.get("file_url")
            or candidate.get("fileUrl")
            or candidate.get("output_url")
            or candidate.get("outputUrl")
            or candidate.get("url")
        )
        if not url:
            continue

        mime_type = _string_or_none(
            candidate.get("mime_type")
            or candidate.get("mimeType")
            or candidate.get("content_type")
            or candidate.get("contentType")
        )
        return VideoGenerationProviderResult(
            video=GeneratedVideo(
                url=url,
                mime_type=mime_type or "video/mp4",
                duration_ms=_video_duration_ms(candidate),
                width=_int_or_none(candidate.get("width")),
                height=_int_or_none(candidate.get("height")),
                thumbnail_url=_string_or_none(
                    candidate.get("thumbnail_url")
                    or candidate.get("thumbnailUrl")
                    or candidate.get("cover_url")
                    or candidate.get("coverUrl")
                    or candidate.get("poster_url")
                    or candidate.get("posterUrl")
                ),
            ),
            provider_task_id=provider_task_id,
        )

    if provider_task_id:
        return VideoGenerationProviderResult(
            video=GeneratedVideo(),
            provider_task_id=provider_task_id,
        )

    raise ProviderExecutionError("Evolink response did not include a video URL or task id.")


def _raise_evolink_response_error(response_data: dict[str, Any]) -> None:
    base_resp = response_data.get("base_resp")
    if isinstance(base_resp, dict):
        status_code = base_resp.get("status_code")
        if isinstance(status_code, int) and status_code != 0:
            status_msg = _string_or_none(base_resp.get("status_msg")) or "unknown error"
            raise ProviderExecutionError(f"Evolink video generation failed: {status_msg}")

    error = response_data.get("error")
    if isinstance(error, str) and error.strip():
        raise ProviderExecutionError(f"Evolink video generation failed: {error.strip()}")
    if isinstance(error, dict):
        message = _string_or_none(error.get("message") or error.get("msg"))
        if message:
            raise ProviderExecutionError(f"Evolink video generation failed: {message}")


def _nested_dict_candidates(value: object) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []

    def visit(item: object) -> None:
        if isinstance(item, dict):
            candidates.append(item)
            for nested in item.values():
                if isinstance(nested, dict | list):
                    visit(nested)
        elif isinstance(item, list):
            for nested in item:
                if isinstance(nested, dict | list):
                    visit(nested)

    visit(value)
    return candidates


def _find_provider_task_id(value: object) -> str | None:
    for candidate in _nested_dict_candidates(value):
        for key in (
            "task_id",
            "taskId",
            "generation_id",
            "generationId",
            "request_id",
            "requestId",
            "id",
        ):
            task_id = _string_or_none(candidate.get(key))
            if task_id:
                return task_id
    return None


def _video_duration_ms(candidate: dict[str, Any]) -> int | None:
    duration_ms = _int_or_none(candidate.get("duration_ms") or candidate.get("durationMs"))
    if duration_ms is not None:
        return duration_ms

    seconds = candidate.get("duration_seconds") or candidate.get("durationSeconds")
    if isinstance(seconds, int):
        return seconds * 1000

    duration = candidate.get("duration")
    if isinstance(duration, int):
        return duration * 1000

    return None


def _prompt_with_duration(prompt: str, duration_seconds: int) -> str:
    stripped = prompt.strip()
    normalized = stripped.lower()
    if "duration" in normalized or "second" in normalized or f"{duration_seconds}s" in normalized:
        return stripped
    return f"{stripped} Duration: {duration_seconds} seconds."


def _looks_like_hex(value: str) -> bool:
    normalized = value.strip()
    if len(normalized) < 2 or len(normalized) % 2 != 0:
        return False
    return all(character in "0123456789abcdefABCDEF" for character in normalized)


def _audio_mime_type(audio_format: str) -> str:
    if audio_format == "wav":
        return "audio/wav"
    if audio_format == "flac":
        return "audio/flac"
    return "audio/mpeg"


def _string_or_none(value: object) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def _int_or_none(value: object) -> int | None:
    return value if isinstance(value, int) else None


def get_script_provider(settings: ScriptProviderSettings | None = None) -> ScriptProvider:
    resolved = settings or ScriptProviderSettings.from_env()
    resolved.validate()
    return OpenAICompatibleScriptProvider(resolved)
