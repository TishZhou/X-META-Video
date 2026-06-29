from __future__ import annotations

from .schemas import ScriptInput


def build_script_prompt(script_input: ScriptInput) -> str:
    fields = [
        ("Creative brief", script_input.creative_brief),
        ("Content type", script_input.content_type.value),
        ("Style", script_input.style),
        ("Theme", script_input.theme),
        ("World setting", script_input.world_setting),
        ("Duration seconds", script_input.duration_seconds),
        ("Language", script_input.language),
        ("Target platform", script_input.target_platform),
        ("Audience", script_input.audience),
        ("Constraints", "; ".join(script_input.constraints)),
        ("References", "; ".join(script_input.references)),
    ]
    details = "\n".join(f"- {label}: {value}" for label, value in fields if value)
    return (
        "Create a structured script package for an X-META Video Script Node.\n"
        "Return JSON matching the ScriptOutput schema exactly.\n"
        f"{details}"
    )

