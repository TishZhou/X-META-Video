from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, Protocol

import httpx
from pydantic import ValidationError

from .schemas import (
    CharacterProfile,
    SceneDescription,
    ScriptInput,
    ScriptOutput,
    StoryboardDirection,
    StoryboardShot,
)


class ProviderConfigurationError(RuntimeError):
    pass


class ProviderExecutionError(RuntimeError):
    pass


class ScriptProvider(Protocol):
    name: str

    def generate(self, script_input: ScriptInput, prompt: str) -> ScriptOutput:
        raise NotImplementedError


SUPPORTED_TEXT_PROVIDERS = {"mock", "openai", "openai-compatible"}


@dataclass(frozen=True)
class ScriptProviderSettings:
    provider: str = "mock"
    base_url: str | None = None
    api_key: str | None = None
    model: str | None = None
    temperature: float | None = None
    timeout_seconds: int = 60
    max_retries: int = 1

    @classmethod
    def from_env(cls) -> "ScriptProviderSettings":
        provider = _first_env("TEXT_MODEL_PROVIDER", "SCRIPT_MODEL_PROVIDER", default="mock")
        temperature = _first_env("TEXT_MODEL_TEMPERATURE", "SCRIPT_MODEL_TEMPERATURE")
        return cls(
            provider=provider.strip().lower() or "mock",
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
            model=_first_env("TEXT_MODEL_NAME", "SCRIPT_MODEL_NAME", default="gpt-5.4-mini"),
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

        if self.provider == "mock":
            return

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


class MockScriptProvider:
    name = "mock"

    def generate(self, script_input: ScriptInput, prompt: str) -> ScriptOutput:
        del prompt
        description = script_input.world_description.rstrip(".")
        title_seed = description[:48]

        return ScriptOutput(
            title=f"MV World: {title_seed}",
            world_overview=(
                f"The MV world-view description expands from: {description}. It is "
                "organized for downstream storyboard, character image, and scene "
                "image nodes."
            ),
            storyboard_direction=StoryboardDirection(
                pov=(
                    "third-person cinematic POV with occasional first-person inserts "
                    "when emotion peaks"
                ),
                visual_rhythm=(
                    "soft opening, kinetic travel beat, then a luminous performance "
                    "payoff"
                ),
                shots=[
                    StoryboardShot(
                        shot_number=1,
                        pov="third-person observer",
                        framing="wide establishing frame",
                        action=(
                            "Introduce the world, the main characters, and the emotional "
                            "distance between them."
                        ),
                        camera_movement="slow push-in from environment to faces",
                        duration_seconds=8,
                    ),
                    StoryboardShot(
                        shot_number=2,
                        pov="first-person insert",
                        framing="handheld close-up sequence",
                        action=(
                            "Show a tactile object or gesture that reveals what the "
                            "characters are searching for."
                        ),
                        camera_movement="quick inserts with a gentle whip transition",
                        duration_seconds=10,
                    ),
                    StoryboardShot(
                        shot_number=3,
                        pov="third-person performance POV",
                        framing="medium-to-wide chorus staging",
                        action=(
                            "Resolve the search into a synchronized visual hook that can "
                            "feed scene and composition nodes."
                        ),
                        camera_movement="orbit move ending on a locked hero frame",
                        duration_seconds=12,
                    ),
                ],
            ),
            characters=[
                CharacterProfile(
                    name="Lead Girl",
                    overview="Sweet visual direction with a lonely, determined core.",
                    style="soft idol MV styling with clean silhouettes",
                    clothing=(
                        "white cropped jacket, pale pink layered skirt, silver hair "
                        "clips, travel-worn boots"
                    ),
                    height="about 165 cm",
                    appearance=(
                        "bright eyes, shoulder-length dark hair, delicate makeup, "
                        "expressive but restrained posture"
                    ),
                    personality="gentle on the surface, stubborn when the goal is threatened",
                    visual_prompt=(
                        "sweet idol heroine, white jacket, pale pink skirt, desert wind, "
                        "clean full-body character reference"
                    ),
                ),
                CharacterProfile(
                    name="Second Girl",
                    overview="Contrasting cool sweetness, protective and quietly bold.",
                    style="retro road-trip styling with neon stage accents",
                    clothing=(
                        "denim vest, cream tank top, black shorts, red scarf, chunky "
                        "bracelets"
                    ),
                    height="about 170 cm",
                    appearance=(
                        "long wavy hair, sharper eyeliner, athletic stance, confident "
                        "half-smile"
                    ),
                    personality="playful under pressure, loyal, and visually assertive",
                    visual_prompt=(
                        "cool sweet idol heroine, denim vest, red scarf, road-trip look, "
                        "full-body character reference"
                    ),
                ),
            ],
            scene_descriptions=[
                SceneDescription(
                    scene_number=1,
                    shot_reference=1,
                    characters=["Lead Girl", "Second Girl"],
                    location="desert highway beside a vintage jeep",
                    description=(
                        "The two girls stand near a sun-faded jeep on an open desert "
                        "road, letting the world-view description become a concrete "
                        "travel scene."
                    ),
                    visual_prompt=(
                        f"{description}, two sweet idol girls, desert highway, vintage "
                        "jeep, warm sunlight, production-ready scene prompt"
                    ),
                ),
                SceneDescription(
                    scene_number=2,
                    shot_reference=2,
                    characters=["Lead Girl"],
                    location="inside the moving jeep",
                    description=(
                        "A close interior scene catches the lead gripping a small "
                        "keepsake while wind and reflected light imply motion."
                    ),
                    visual_prompt=(
                        "inside a desert jeep, close-up emotional insert, sweet idol MV, "
                        "dusty window reflections"
                    ),
                ),
                SceneDescription(
                    scene_number=3,
                    shot_reference=3,
                    characters=["Lead Girl", "Second Girl"],
                    location="night neon performance stage",
                    description=(
                        "The road world transforms into a neon stage where both "
                        "characters perform the final visual hook."
                    ),
                    visual_prompt=(
                        "night neon stage, two idol characters, synchronized chorus pose, "
                        "cinematic MV scene"
                    ),
                ),
            ],
            missing_inputs=[],
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
            return ScriptOutput.model_validate(json.loads(response_text))
        except json.JSONDecodeError as exc:
            raise ProviderExecutionError("Text model returned invalid JSON.") from exc
        except ValidationError as exc:
            raise ProviderExecutionError(
                "Text model returned JSON that does not match ScriptOutput."
            ) from exc

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
    for name in names:
        value = os.getenv(name)
        if value is not None and value.strip():
            return value.strip()
    return default


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
    if resolved.provider == "mock":
        return MockScriptProvider()
    return OpenAICompatibleScriptProvider(resolved)
