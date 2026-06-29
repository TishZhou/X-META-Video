from __future__ import annotations

from .schemas import ScriptInput


def build_script_prompt(script_input: ScriptInput) -> str:
    fields = [
        ("MV world description", script_input.world_description),
    ]
    details = "\n".join(f"- {label}: {value}" for label, value in fields if value)
    return (
        "Expand one MV world-view prompt for an X-META Video Script Node.\n"
        "The output must contain storyboard direction, character profiles, and "
        "concrete scene descriptions derived from the prompt.\n"
        "Return JSON matching the ScriptOutput schema exactly.\n"
        f"{details}"
    )
