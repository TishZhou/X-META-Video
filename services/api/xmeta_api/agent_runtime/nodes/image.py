from __future__ import annotations

from collections.abc import Callable

from ...providers import SeedDreamProviderSettings
from ...schemas import (
    CharacterDerivedImageRequest,
    GeneratedImage,
    GeneratedImageOutput,
    ImageGenerationNodeType,
    ImageGenerationInput,
    ImageOutputVariant,
    ImageGenerationRequest,
    ImageGenerationResponse,
)
from ..compiler import PromptCompiler
from ..contracts import TaskId, TaskProfile
from ..retry import run_with_task_retry
from ..validators import validate_output


ImageExecutor = Callable[..., GeneratedImage]
ProfileResolver = Callable[[TaskId | str], TaskProfile]

_IMAGE_TASKS = {
    ImageGenerationNodeType.CHARACTER_IMAGE: TaskId.IMAGE_CHARACTER_GENERATE,
    ImageGenerationNodeType.PROP_ASSET: TaskId.IMAGE_PROP_GENERATE,
    ImageGenerationNodeType.SCENE_IMAGE: TaskId.IMAGE_SCENE_GENERATE,
}

_CHARACTER_BASE_PROMPT = (
    "输出类型：角色底图。生成一张全身、正面、站姿的角色底图；轮廓清晰可辨，"
    "完整呈现人物面部、发型、体型、服装和配饰。"
)

_CHARACTER_THREE_VIEW_PROMPT = """输出类型：角色标准三视图。仅以随附的角色底图作为唯一视觉参考，完整复刻底图人物的脸型与五官比例、肤色、发质与发型、体型、服装、配饰及美术风格；不得混入、借用或改造任何其他人物参考。

输出比例固定为 3:4。画面只能是图片：禁止任何文字、标题、标签、编号、说明、Logo 或水印。使用纯白背景、细微真实物理阴影与中性全局照明，采用干净整齐的横向单排多面板布局。

画面必须且仅包含 3 个等比例、完整全身、标准站姿格位；从左至右固定为：正面、左侧面、背面。三者身高、头身比、体型、服装褶皱和配饰严格一致，脚部完整可见且与地面有自然接触。

严禁出现任何面部表情特写、动态动作、坐姿、额外人物、额外格位或拼贴内容。每个指定格位必须完整、独立且只出现一次，严禁合并格位、遗漏格位或用重复图替代。"""

_CHARACTER_EXPRESSION_ACTION_SHEET_PROMPT = """输出类型：角色表情与动态设定集。仅以随附的角色底图作为唯一视觉参考，完整复刻底图人物的脸型与五官比例、肤色、发质与发型、体型、服装、配饰及美术风格；不得混入、借用或改造任何其他人物参考。

输出比例固定为 3:4。画面只能是图片：禁止任何文字、标题、标签、编号、说明、Logo 或水印。使用纯白背景、细微真实物理阴影与中性全局照明，采用干净整齐的两行多面板布局。每个指定格位必须完整、独立且只出现一次，严禁合并格位、遗漏格位、增加未指定格位或用重复图替代。

第一横排必须且仅包含 6 个等尺寸面部特写格位，从左至右固定为：喜悦、悲伤、愤怒、惊讶、恐惧、中性。每个表情必须清楚区分，写实呈现面部肌肉联动、皮肤质感与毛孔细节，人物身份与五官比例不得漂移。

第二横排必须且仅包含 4 个等比例完整全身动态格位，从左至右固定为：走路、奔跑、跳跃、坐姿。所有动作必须自然可信：关节解剖结构正确，肩颈、脊柱、骨盆、手脚的受力关系合理，重心稳定，脚部或坐姿与地面/座面有明确接触；避免僵硬、悬浮、扭曲或不可能姿势。服装样式、装饰和角色身份必须与底图完全一致，并通过自然的布料垂坠、褶皱、拉伸和惯性表现动作受力与真实抓拍感。

严禁出现标准三视图、额外人物、额外格位或拼贴内容。"""


class ImageNodeExecutor:
    """Executes the Image tasks selected by a user-authored canvas node."""

    def __init__(
        self,
        *,
        profile_resolver: ProfileResolver,
        prompt_compiler: PromptCompiler,
    ) -> None:
        self._profile_resolver = profile_resolver
        self._prompt_compiler = prompt_compiler

    def run_generation(
        self,
        *,
        project_id: str,
        node_id: str,
        request: ImageGenerationRequest,
        settings: SeedDreamProviderSettings,
        execute: ImageExecutor,
    ) -> ImageGenerationResponse:
        profile = self._profile_resolver(_IMAGE_TASKS[request.node_type])
        compiled_prompt = self._prompt_compiler.compile(
            profile=profile,
            project_id=project_id,
            inputs={"prompt": request.input.prompt},
        ).text
        def generate(
            variant_instruction: str,
            reference: ImageGenerationInput | GeneratedImage,
        ) -> GeneratedImage:
            prompt = "\n\n".join(
                part for part in (compiled_prompt, variant_instruction) if part
            )
            generated_image = run_with_task_retry(
                profile=profile,
                operation=lambda prompt=prompt: execute(
                    settings=settings,
                    prompt=prompt,
                    reference_image_url=reference.reference_image_url
                    if isinstance(reference, ImageGenerationInput)
                    else reference.url,
                    reference_image_b64=reference.reference_image_b64
                    if isinstance(reference, ImageGenerationInput)
                    else reference.b64_json,
                    reference_image_mime_type=reference.reference_image_mime_type
                    if isinstance(reference, ImageGenerationInput)
                    else reference.mime_type,
                ),
            )
            validate_output(profile.validator_id, generated_image)
            return generated_image

        if request.node_type == ImageGenerationNodeType.CHARACTER_IMAGE:
            character_base = generate(_CHARACTER_BASE_PROMPT, request.input)
            outputs = [
                GeneratedImageOutput(
                    variant=ImageOutputVariant.CHARACTER_BASE,
                    image=character_base,
                ),
            ]
        else:
            image = generate("", request.input)
            outputs = [GeneratedImageOutput(variant=ImageOutputVariant.IMAGE, image=image)]
        assert settings.model is not None
        return ImageGenerationResponse(
            project_id=project_id,
            node_id=node_id,
            node_type=request.node_type,
            provider=settings.provider,
            model=settings.model,
            prompt=request.input.prompt,
            image=outputs[0].image,
            images=outputs,
            persisted=False,
        )

    def run_character_derived_generation(
        self,
        *,
        project_id: str,
        node_id: str,
        request: CharacterDerivedImageRequest,
        settings: SeedDreamProviderSettings,
        execute: ImageExecutor,
    ) -> ImageGenerationResponse:
        """Generate only after the user explicitly approves the base-image follow-up."""
        profile = self._profile_resolver(TaskId.IMAGE_CHARACTER_GENERATE)
        compiled_prompt = self._prompt_compiler.compile(
            profile=profile,
            project_id=project_id,
            inputs={"prompt": "Generate approved character derivatives from the supplied base image."},
        ).text

        def generate(variant_instruction: str) -> GeneratedImage:
            generated_image = run_with_task_retry(
                profile=profile,
                operation=lambda: execute(
                    settings=settings,
                    prompt="\n\n".join((compiled_prompt, variant_instruction)),
                    reference_image_url=request.base_image.url,
                    reference_image_b64=request.base_image.b64_json,
                    reference_image_mime_type=request.base_image.mime_type,
                ),
            )
            validate_output(profile.validator_id, generated_image)
            return generated_image

        validate_output(profile.validator_id, request.base_image)
        character_three_view = generate(_CHARACTER_THREE_VIEW_PROMPT)
        character_expression_action_sheet = generate(
            _CHARACTER_EXPRESSION_ACTION_SHEET_PROMPT,
        )
        assert settings.model is not None
        return ImageGenerationResponse(
            project_id=project_id,
            node_id=node_id,
            node_type=ImageGenerationNodeType.CHARACTER_IMAGE,
            provider=settings.provider,
            model=settings.model,
            prompt="Approved character base image -> three-view + expression/action derivatives.",
            image=character_three_view,
            images=[
                GeneratedImageOutput(
                    variant=ImageOutputVariant.CHARACTER_THREE_VIEW,
                    image=character_three_view,
                ),
                GeneratedImageOutput(
                    variant=ImageOutputVariant.CHARACTER_EXPRESSION_ACTION_SHEET,
                    image=character_expression_action_sheet,
                ),
            ],
            persisted=False,
        )
