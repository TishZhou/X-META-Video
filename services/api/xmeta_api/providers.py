from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Protocol

from .schemas import (
    CharacterProfile,
    DialogueLine,
    ScriptInput,
    ScriptOutput,
    ShotPlanItem,
    StoryBeat,
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
        content_type = script_input.content_type.value.replace("_", " ")
        title_seed = script_input.creative_brief.rstrip(".")[:48]
        shot_duration = max(1, script_input.duration_seconds // 3)

        return ScriptOutput(
            title=f"{content_type.title()}: {title_seed}",
            logline=(
                f"A {script_input.style} {content_type} for {script_input.target_platform} "
                f"about {script_input.creative_brief.rstrip('.')}."
            ),
            plot_summary=(
                f"In {script_input.world_setting}, the story explores {script_input.theme}. "
                "The structure is ready for downstream storyboard, character, scene, audio, "
                "and video nodes."
            ),
            characters=[
                CharacterProfile(
                    name="Lead",
                    role="protagonist",
                    personality="Resourceful, emotionally guarded, and quick under pressure.",
                    visual_prompt=(
                        f"Lead character in {script_input.world_setting}, {script_input.style}, "
                        "clear silhouette, production reference sheet."
                    ),
                    dialogue_style="Short, decisive lines with a hidden emotional edge.",
                ),
                CharacterProfile(
                    name="Counterpart",
                    role="foil",
                    personality="Charismatic, skeptical, and able to raise the stakes.",
                    visual_prompt=(
                        f"Counterpart character matching {script_input.style}, contrast to Lead, "
                        "expressive face, reusable visual identity."
                    ),
                    dialogue_style="Calm challenges that force the lead to reveal intent.",
                ),
            ],
            story_beats=[
                StoryBeat(
                    beat="Opening hook",
                    purpose="Establish conflict",
                    summary="Open on a problem that makes the brief immediately visible.",
                ),
                StoryBeat(
                    beat="Escalation",
                    purpose="Force a decision",
                    summary="The lead discovers the cost of hesitation and commits to action.",
                ),
                StoryBeat(
                    beat="Payoff",
                    purpose="Create a reusable final image",
                    summary="The emotional turn resolves into a clear cliffhanger or finish.",
                ),
            ],
            shot_plan=[
                ShotPlanItem(
                    shot_number=1,
                    scene="Opening",
                    action="Establish the world, lead, and core conflict.",
                    characters=["Lead"],
                    dialogue="Lead: This is the moment everything changes.",
                    camera="Wide establishing frame, then push toward the lead.",
                    duration_seconds=shot_duration,
                    image_prompt=(
                        f"{script_input.world_setting}, opening conflict, {script_input.style}, "
                        "cinematic composition."
                    ),
                ),
                ShotPlanItem(
                    shot_number=2,
                    scene="Confrontation",
                    action="The counterpart blocks the lead and exposes the hidden risk.",
                    characters=["Lead", "Counterpart"],
                    dialogue="Counterpart: Then prove what this story is worth.",
                    camera="Alternating close-ups with a slow lateral move.",
                    duration_seconds=shot_duration,
                    image_prompt=(
                        f"High-stakes confrontation in {script_input.world_setting}, "
                        f"{script_input.style}, readable staging."
                    ),
                ),
                ShotPlanItem(
                    shot_number=3,
                    scene="Final image",
                    action="The lead turns the situation into a hook for the next node.",
                    characters=["Lead", "Counterpart"],
                    dialogue="Lead: Watch closely. I only need one chance.",
                    camera="Steady final push-in with a strong silhouette.",
                    duration_seconds=max(1, script_input.duration_seconds - shot_duration * 2),
                    image_prompt=(
                        f"Memorable final image, {script_input.theme}, {script_input.style}, "
                        "short video ending frame."
                    ),
                ),
            ],
            dialogue_or_lyrics=[
                DialogueLine(
                    speaker="Lead",
                    text="This is the moment everything changes.",
                    delivery="Quiet confidence, under pressure.",
                ),
                DialogueLine(
                    speaker="Counterpart",
                    text="Then prove what this story is worth.",
                    delivery="Calm challenge, controlled tension.",
                ),
                DialogueLine(
                    speaker="Lead",
                    text="Watch closely. I only need one chance.",
                    delivery="Low voice, decisive final beat.",
                ),
            ],
            camera_notes=[
                "Use wide-to-close framing to make the hook legible.",
                "Keep shot transitions simple so Feature 4 can expand the storyboard.",
                "Preserve character continuity with stable silhouettes and wardrobe notes.",
            ],
            scene_prompts=[
                f"{script_input.world_setting}, {script_input.style}, production-ready location.",
                f"Emotional confrontation scene, {script_input.theme}, clean subject separation.",
            ],
            audio_notes=[
                f"Keep dialogue clear for {script_input.audience}.",
                "Build music intensity at the escalation beat and leave space for final line.",
            ],
            production_checklist=[
                "Confirm character names before image generation.",
                "Review shot durations before storyboard expansion.",
                "Pass selected visual prompts to character and scene nodes.",
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
