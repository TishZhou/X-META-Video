from __future__ import annotations

from .schemas import ScriptDialogueMessage, ScriptInput


def build_script_prompt(script_input: ScriptInput) -> str:
    fields = [
        ("MV world description", script_input.world_description),
    ]
    details = "\n".join(f"- {label}: {value}" for label, value in fields if value)
    return (
        "Expand one MV world-view prompt for an X-META Video Script Node.\n"
        "The output must contain storyboard direction, character profiles, and "
        "concrete scene descriptions derived from the prompt.\n"
        "Return JSON matching the ScriptOutput schema exactly. Include "
        "agent_output as the natural-language answer that should be shown in "
        "the chat history; it must not be a placeholder or UI status message.\n"
        f"{details}"
    )


def build_script_dialogue_prompt(
    script_input: ScriptInput,
    history: list[ScriptDialogueMessage],
    user_message: str,
) -> str:
    transcript = "\n".join(
        f"{message.role.value}: {message.content}" for message in history[-20:]
    )
    if not transcript:
        transcript = "(no previous dialogue)"

    return (
        "You are the Script Node AI inside X-META Video. Reply conversationally "
        "to the user's latest request about the MV world, script, characters, "
        "storyboard direction, or scene ideas.\n"
        "Do not return JSON for this chat endpoint. Do not claim image, audio, "
        "video, export, durable storage, or production persistence is complete.\n"
        f"Current MV world description: {script_input.world_description}\n"
        f"Dialogue so far:\n{transcript}\n"
        f"Latest user message: {user_message}\n"
        "Assistant reply:"
    )
