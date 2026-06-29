from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Protocol

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


@dataclass(frozen=True)
class ScriptProviderSettings:
    provider: str = "mock"
    base_url: str | None = None
    api_key: str | None = None
    model: str | None = None
    timeout_seconds: int = 60
    max_retries: int = 1

    @classmethod
    def from_env(cls) -> "ScriptProviderSettings":
        return cls(
            provider=os.getenv("SCRIPT_MODEL_PROVIDER", "mock").strip().lower() or "mock",
            base_url=os.getenv("SCRIPT_MODEL_BASE_URL"),
            api_key=os.getenv("SCRIPT_MODEL_API_KEY"),
            model=os.getenv("SCRIPT_MODEL_NAME"),
            timeout_seconds=int(os.getenv("SCRIPT_MODEL_TIMEOUT_SECONDS", "60")),
            max_retries=int(os.getenv("SCRIPT_MODEL_MAX_RETRIES", "1")),
        )

    def validate(self) -> None:
        if self.provider == "mock":
            return

        missing = [
            env_name
            for env_name, value in (
                ("SCRIPT_MODEL_BASE_URL", self.base_url),
                ("SCRIPT_MODEL_API_KEY", self.api_key),
                ("SCRIPT_MODEL_NAME", self.model),
            )
            if not value
        ]
        if missing:
            joined = ", ".join(missing)
            raise ProviderConfigurationError(
                f"Script provider '{self.provider}' requires missing config: {joined}."
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
    def __init__(self, settings: ScriptProviderSettings) -> None:
        self.name = settings.provider
        self._settings = settings

    def generate(self, script_input: ScriptInput, prompt: str) -> ScriptOutput:
        del script_input, prompt
        raise ProviderExecutionError(
            "OpenAI-compatible script generation is configured but not executed in this MVP."
        )


def get_script_provider(settings: ScriptProviderSettings | None = None) -> ScriptProvider:
    resolved = settings or ScriptProviderSettings.from_env()
    resolved.validate()
    if resolved.provider == "mock":
        return MockScriptProvider()
    return OpenAICompatibleScriptProvider(resolved)
