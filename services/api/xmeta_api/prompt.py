"""Compatibility imports for Script prompt helpers now owned by Agent Runtime."""

from .agent_runtime.prompts import build_script_dialogue_prompt, build_script_prompt

__all__ = ["build_script_dialogue_prompt", "build_script_prompt"]
