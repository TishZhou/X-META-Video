from __future__ import annotations

from collections.abc import Mapping
import json

from ..schemas import ScriptDialogueMessage, ScriptDialogueMode, ScriptInput
from .contracts import MemoryScope, PromptTemplateId


TEXT_GENERATION_COMMON_RULES = (
    "Return editable plain text in the input's primary language. "
    "Do not return JSON, markdown fences, provider data, duplicated source text, "
    "or claims that media generation, durable storage, or persistence is complete. "
    "Use concrete, internally consistent production language that downstream creative "
    "tasks can reuse without extra explanatory commentary."
)


def _build_text_generation_prompt(*, task_instructions: str, content: str) -> str:
    return (
        "You are the Text Node agent inside X-META Video.\n"
        f"Shared rules: {TEXT_GENERATION_COMMON_RULES}\n"
        f"Task instructions: {task_instructions}\n"
        f"Canonical input:\n{content}\n"
        "Editable output:"
    )


def build_ip_worldview_prompt(content: str) -> str:
    return _build_text_generation_prompt(
        task_instructions=(
            "Expand the brief into an IP narrative and world-view document. Include "
            "explicit labeled sections for IP/narrative positioning, core theme, world "
            "rules or dimensions, and named character positioning. Keep character roles, "
            "abilities, relationships, and story function mutually consistent."
        ),
        content=content,
    )


def build_character_profiles_prompt(content: str) -> str:
    return _build_text_generation_prompt(
        task_instructions=(
            "Use the supplied Task 1 world-view content as the source of truth. Cover every "
            "named character from that source without omission. For each character, include "
            "concrete appearance/visual look details (外貌、视觉造型、发型、穿搭), "
            "personality/temperament and action/movement language "
            "(性格、个性、气质、动作、肢体), and a distinct voice/vocal tone/timbre "
            "description (声线、嗓音、人声、唱腔、音色) suitable for voice generation. "
            "Write natural, editable plain text in any clear format; these concepts are content "
            "guidance, not required labels. Do not require fixed labels, delimiters, JSON, or "
            "another schema."
        ),
        content=content,
    )


def build_mv_look_development_prompt(*, character_profile: str, mv_brief: str) -> str:
    return _build_text_generation_prompt(
        task_instructions=(
            "Develop an MV-specific visual look from the supplied character profile and MV "
            "brief. Preserve stable identity anchors such as face shape, recognizable hair, "
            "and defining traits. Describe the MV-integrated outfit, silhouette, materials, "
            "color palette, hair and makeup treatment, and visual-character details. Add "
            "accessories or props only when they serve the brief; do not assume the input "
            "already includes an outfit or accessories. Keep the result as reusable, editable "
            "natural text for image-prompt development, without claiming image locking, asset "
            "generation, durable storage, or persistence.\n"
            f"Character profile:\n{character_profile}\n"
            f"MV brief:\n{mv_brief}"
        ),
        content="Use the two inputs above as the source of truth.",
    )


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
    mode: ScriptDialogueMode = ScriptDialogueMode.DIALOGUE,
) -> str:
    transcript = "\n".join(f"{message.role.value}: {message.content}" for message in history[-20:])
    if not transcript:
        transcript = "(no previous dialogue)"

    if mode == ScriptDialogueMode.DIRECT_OUTPUT:
        return (
            "You are the Script Node AI inside X-META Video. Write the direct "
            "Script outcome as editable plain text for a canvas output node.\n"
            "Do not return JSON, markdown fences, provider raw data, image/audio/video "
            "claims, durable storage claims, or production persistence claims.\n"
            "Do not force the answer into a schema or fixed section template. Write "
            "natural script-development prose that a user can edit directly. Reflect "
            "the dialogue context when it is relevant.\n"
            f"Current MV world description: {script_input.world_description}\n"
            f"Dialogue so far:\n{transcript}\n"
            f"Direct Script outcome request: {user_message}\n"
            "Direct editable output:"
        )

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


def render_prompt_template(
    *,
    template_id: PromptTemplateId,
    inputs: Mapping[str, object],
    memory: Mapping[MemoryScope, object],
) -> str:
    if template_id == PromptTemplateId.SCRIPT_GENERATE_V1:
        script_input = inputs["script_input"]
        if not isinstance(script_input, ScriptInput):
            raise TypeError("script_input must be a ScriptInput.")
        prompt = build_script_prompt(script_input)
    elif template_id == PromptTemplateId.SCRIPT_DIALOGUE_V1:
        script_input = inputs["script_input"]
        history = inputs["history"]
        user_message = inputs["user_message"]
        mode = inputs["mode"]
        if not isinstance(script_input, ScriptInput):
            raise TypeError("script_input must be a ScriptInput.")
        if not isinstance(history, list) or not all(
            isinstance(message, ScriptDialogueMessage) for message in history
        ):
            raise TypeError("history must contain ScriptDialogueMessage values.")
        if not isinstance(user_message, str):
            raise TypeError("user_message must be a string.")
        if not isinstance(mode, ScriptDialogueMode):
            raise TypeError("mode must be a ScriptDialogueMode.")
        prompt = build_script_dialogue_prompt(
            script_input=script_input,
            history=history,
            user_message=user_message,
            mode=mode,
        )
    elif template_id in {
        PromptTemplateId.TEXT_IP_WORLDVIEW_V1,
        PromptTemplateId.TEXT_CHARACTER_PROFILES_V1,
        PromptTemplateId.TEXT_MV_LOOK_DEVELOPMENT_V1,
    }:
        content = inputs.get("content")
        if template_id == PromptTemplateId.TEXT_IP_WORLDVIEW_V1:
            if not isinstance(content, str):
                raise TypeError("content must be a string.")
            prompt = build_ip_worldview_prompt(content)
        elif template_id == PromptTemplateId.TEXT_CHARACTER_PROFILES_V1:
            if not isinstance(content, str):
                raise TypeError("content must be a string.")
            prompt = build_character_profiles_prompt(content)
        else:
            character_profile = inputs["character_profile"]
            mv_brief = inputs["mv_brief"]
            if not isinstance(character_profile, str) or not isinstance(mv_brief, str):
                raise TypeError("character_profile and mv_brief must be strings.")
            prompt = build_mv_look_development_prompt(
                character_profile=character_profile,
                mv_brief=mv_brief,
            )
    else:
        prompt_value = inputs["prompt"]
        if not isinstance(prompt_value, str):
            raise TypeError("prompt must be a string.")
        prompt = prompt_value

    if not memory:
        return prompt

    memory_payload = {scope.value: memory[scope] for scope in memory}
    return (
        f"{prompt}\n"
        "Approved project memory (declared scopes only):\n"
        f"{json.dumps(memory_payload, ensure_ascii=False, default=str, sort_keys=True)}"
    )
