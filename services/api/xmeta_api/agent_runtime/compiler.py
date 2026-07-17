from __future__ import annotations

from collections.abc import Mapping

from .contracts import CompiledPrompt, TaskProfile
from .memory import ProjectMemoryReader, read_profile_memory
from .prompts import render_prompt_template


class TaskInputError(ValueError):
    pass


class PromptCompiler:
    def __init__(self, memory_reader: ProjectMemoryReader) -> None:
        self._memory_reader = memory_reader

    def compile(
        self,
        *,
        profile: TaskProfile,
        project_id: str,
        inputs: Mapping[str, object],
    ) -> CompiledPrompt:
        missing = [name for name in profile.required_inputs if name not in inputs]
        if missing:
            raise TaskInputError(
                f"Task '{profile.task_id}' is missing required inputs: {', '.join(missing)}."
            )

        memory = read_profile_memory(
            reader=self._memory_reader,
            project_id=project_id,
            profile=profile,
        )
        text = render_prompt_template(
            template_id=profile.prompt_template_id,
            inputs=inputs,
            memory=memory,
        )
        return CompiledPrompt.create(profile=profile, text=text, memory=memory)
