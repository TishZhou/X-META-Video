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
    ScriptDialogueMessage,
    ScriptInput,
    ScriptOutput,
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


def get_script_provider(settings: ScriptProviderSettings | None = None) -> ScriptProvider:
    resolved = settings or ScriptProviderSettings.from_env()
    resolved.validate()
    return OpenAICompatibleScriptProvider(resolved)
