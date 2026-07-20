# 节点设计（Phase 1）

## 1. 设计原则

画布只提供四种创作节点：`Text`、`Image`、`Audio`、`Video`。节点表示可生成的媒介能力；节点中的 `taskId` 表示本次要完成的业务操作。人物、世界观、分镜、造型、场景、镜头和音乐不是新的节点类型，而是四类节点可选择的任务。

用户在画布上连接节点，并显式选择任务。Runtime 只执行已选择的任务：它不能自行改连线、替换 `taskId`、提高生成次数、选择付费模型或自动启动下游节点。一键生成是可查看、可编辑的确定性工作流预设，不是黑盒 Agent。

```txt
Canvas Node(kind + taskId + 输入 Artifact)
  -> Router -> AgentRuntime -> TaskProfile -> NodeExecutor
  -> Provider -> Validator -> TaskRun（执行记录）+ Artifact（结果）
```

## 2. 节点通用约定

每个节点实例保存：`kind`、`taskId`、输入 Artifact 版本引用、用户参数和输出 Artifact 引用。TaskProfile 是注册表中对任务能力的定义，TaskRun 是一次具体执行记录；两者不能混用。

以下为目标 Runtime 契约伪代码；当前 Python `TaskProfile` 已有任务、输入、记忆、提示词、输出、校验和重试字段，`strategy` 是待补齐的目标字段。

```ts
type NodeKind = "text" | "image" | "audio" | "video";

type TaskProfile = {
  id: string;
  nodeKind: NodeKind;
  requiredInputs: ArtifactType[];
  outputType: ArtifactType;
  memoryScopes: MemoryScope[];
  promptId: string;
  strategy: "direct" | "pipeline" | "bounded_agent";
  validatorId: string;
};
```

- `direct`：固定输入、提示词、一次模型调用和校验。图片、音频、视频生成的默认方式。
- `pipeline`：固定工程步骤，例如结构化分镜、校验、批量镜头扇出与受限修复。
- `bounded_agent`：仅在少数步骤无法预先固定的任务中使用；工具、步数、成本与重试都由 Profile 限制。它不能修改画布或审批状态。

模型负责内容推理；Runtime 负责权限、输入、记忆、提示词、调用、校验和产物血缘。并非每次模型 API 调用都需要 Agentic 循环。

## 3. Text Node：创意与结构化文本

Text Node 输出可编辑的结构化文本或镜头数据。它承接 IP 从 0 到 1 的前期规划，也可在下游为 Image、Audio、Video 编译提示词。

| 任务 | 建议 taskId | 输入 | 输出 | 策略 |
| --- | --- | --- | --- | --- |
| IP 世界观 | `text.ip_worldview.generate` | 用户原始创意、题材、受众 | 世界观、角色定位、冲突与风格约束 | `direct` |
| 角色档案 | `text.character_profiles.generate` | 世界观、角色设定 | 外貌、性格、关系、声音/表演描述 | `direct` |
| MV 视觉造型 | `text.mv_look_development.generate` | 角色档案、MV brief | 服装、妆发、形体、色彩与身份锚点 | `direct` |
| 剧本/对话 | `text.script.generate` / `text.script.dialogue` | 创意、世界观、角色、时长 | 场景、动作、台词、节奏 | `pipeline` |
| 分镜与镜头表 | `text.storyboard.generate` | 剧本、角色造型、MV idea | 镜头序号、景别、机位、时长、画面/视频提示词 | `pipeline` |
| 音乐 brief 与歌词 | `text.music_brief.generate` | MV idea、情绪、时长、镜头节奏 | 音乐概念、歌词、段落和节拍要求 | `direct` |

当前 Runtime 已注册：IP 世界观、角色档案、MV 视觉造型、剧本、剧本对话五项 Text Profile。分镜和音乐 brief 是 Phase 1 计划任务；注册前不得在 UI 中显示为可执行任务。

Text 任务默认读取最小必要记忆：项目 brief、已批准的世界观/角色/脚本 Artifact 和用户本次输入。角色与 MV 任务必须保留用户提供的脸部、发型、声音等身份锚点，不能凭空覆盖。

## 4. Image Node：视觉资产与关键帧

原有的 “Graph Node” 统一为 Image Node。Image Node 生成或编辑可复用图像 Artifact；同一个节点通过不同任务服务人物、道具、场景和分镜关键帧。

| 任务 | 建议 taskId | 输入 | 输出 | 策略 |
| --- | --- | --- | --- | --- |
| 人物底图/三视图 | `image.character.generate` | 角色档案、风格/比例要求 | 人物底图、三视图或角色候选图 | `direct` |
| 人物 MV 造型图 | `image.character.look.generate` | 人物底图、MV 视觉造型 | 面部细节、全身造型、服装候选图 | `direct` |
| 道具资产 | `image.prop.generate` | 剧本/分镜中的道具描述 | 可复用道具图 | `direct` |
| 场景资产 | `image.scene.generate` | 场景描述、风格锚点 | 背景/场景图 | `direct` |
| 分镜关键帧/构图 | `image.keyframe.generate` | 镜头表、人物、场景、参考图 | 单镜头构图图或关键帧 | `pipeline` |
| 一致性修复/图像编辑 | `image.edit` | 现有图像、修改指令、身份锚点 | 新版本图像 Artifact | `direct` |

当前 Runtime 已注册人物、道具、场景三项 Image Profile。人物造型、关键帧和编辑任务须在 Profile、Provider 能力、输入校验都具备后才开放。图像 Artifact 必须保存来源任务、提示词/模型元数据、参考输入和版本血缘；下游引用版本 ID，不复制图片。

## 5. Audio Node：音乐与音频版本

| 任务 | 建议 taskId | 输入 | 输出 | 策略 |
| --- | --- | --- | --- | --- |
| 音乐生成 | `audio.music.generate` | 音乐 brief、歌词、时长、情绪 | 可播放音乐 Artifact | `direct` |
| 音乐编辑/翻唱 | `audio.music.edit` | 已有音频、编辑目标、参考文本 | 新版本音频 Artifact | `direct` |

当前 Runtime 已注册音乐生成 Profile。音乐编辑/翻唱依赖稳定且合规的 Provider 能力，属于后续扩展；音色与风格化音乐属于 Phase 3。Audio Node 只消费明确连接的文本/音频 Artifact；任何音色或版权相关任务必须有用户可见的授权和确认边界。

## 6. Video Node：镜头生成与延展

| 任务 | 建议 taskId | 输入 | 输出 | 策略 |
| --- | --- | --- | --- | --- |
| 图生视频/单镜头 | `video.clip.generate` | 关键帧或参考图、镜头提示词、时长 | 视频片段或 Provider task reference | `direct` |
| 首尾帧视频 | `video.first_last_frame.generate` | 首帧、尾帧、动作/镜头描述 | 视频片段 | `direct` |
| 参考引导视频 | `video.reference_guided.generate` | 参考视频/图、镜头提示词 | 视频片段 | `direct` |
| 延长/重生成 | `video.clip.extend` / `video.clip.regenerate` | 原视频 Artifact、修改指令 | 新版本视频片段 | `direct` |
| 已批准镜头批量生成 | `video.batch.generate` | 已批准镜头表和关键帧集合 | 多个可追踪片段 | `pipeline` |

当前 Runtime 已注册单镜头生成 Profile。视频 Provider 可能异步返回任务引用；未实现轮询、持久化和下载时，界面必须明确显示其状态，不得伪装成可播放成片。剪辑拆分与最终导出是确定性工作流/平台能力，不增加第五类创作节点。

## 7. Memory、校验与错误边界

TaskProfile 声明每项任务可读取的记忆范围；Runtime 只注入该范围内、已批准且与项目一致的 Artifact。推荐的 Phase 1 范围为：

```ts
type MemoryScope =
  | "project_bible"
  | "character_bible"
  | "mv_bible"
  | "style_rules"
  | "music_brief"
  | "shot_context"
  | "selected_assets"
  | "continuity";
```

Validator 检查输出类型、结构字段、媒体引用、Provider 错误和任务状态。失败只影响当前 TaskRun；成功的上游 Artifact 保留并可作为新一次重试的输入。当前项目的持久化 TaskRun、资产库、对象存储和通用 `node.taskId` 工作流保存仍是目标能力，接口返回 `persisted=false` 时必须如实标注。

## 8. 一键生成预设与后续阶段

一键生成预设创建一个可见的固定 DAG：Text（IP/剧本）-> Image（人物/关键帧）-> Audio（音乐）-> Video（镜头）。每个节点仍有明确 Task、输入和审批点；用户可以在执行前修改节点、连接或任务。

- Phase 2：以 Asset Library 保存和复用 Artifact，接入 LoRA 模型选项与 3D 人物/世界适配器；仍复用四类节点和 TaskProfile。
- Phase 3：接入稳定的音乐/音色模型（例如 `audio.voice_style.generate`），增加 IP 运营助手与社区协作。发布、活动、审批和其他有成本或外部影响的动作始终需要人类确认。
