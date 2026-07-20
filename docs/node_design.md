# Node Design（Phase 1）

## Scope

Phase 1 只有四类创建节点：`Text`、`Image`、`Audio`、`Video`。节点定义媒介能力，`taskId` 定义具体业务操作；人物、分镜、场景、镜头和音乐均是任务，不是新节点。

状态定义：**已完成** 表示对应 TaskProfile 已在 Agent Runtime 注册；**计划中** 表示未注册，UI 不得显示为可执行任务。任务运行状态与资产持久化另由 TaskRun 和 Artifact 管理。

## Runtime Contract

```txt
Canvas Node(kind, taskId, input Artifact IDs)
  -> Router -> AgentRuntime -> TaskProfile -> NodeExecutor
  -> Provider -> Validator -> TaskRun + Artifact
```

| 对象 | 责任 |
| --- | --- |
| `node.taskId` | 用户为该画布节点显式选择的任务 |
| `TaskProfile` | 任务的输入、记忆、提示词、输出、校验与重试约束 |
| `TaskRun` | 单次执行的状态、成本、错误和输出引用 |
| `Artifact` | 可复用的版本化文本、图像、音频或视频结果 |

任务默认采用 `direct`；固定多步骤采用 `pipeline`；只有受工具、步数、成本和重试限制的任务可采用 `bounded_agent`。Agent 不得改变 `taskId`、画布连线、模型费用或审批状态。

## Text Node

| Task | taskId | 输入 | 输出 | 策略 | 状态 |
| --- | --- | --- | --- | --- | --- |
| IP 世界观 | `text.ip_worldview.generate` | 创意、题材、受众 | 世界观、角色定位、风格约束 | direct | 已完成 |
| 角色档案 | `text.character_profiles.generate` | 世界观、角色设定 | 外貌、性格、关系、声音描述 | direct | 已完成 |
| MV 视觉造型 | `text.mv_look_development.generate` | 角色档案、MV brief | 服装、妆发、形体、身份锚点 | direct | 已完成 |
| 剧本 | `text.script.generate` | 创意、世界观、角色、时长 | 场景、动作、台词、节奏 | pipeline | 已完成 |
| 剧本对话 | `text.script.dialogue` | 剧本、历史、用户指令 | 对话文本 | direct | 已完成 |
| 分镜与镜头表 | `text.storyboard.generate` | 剧本、造型、MV idea | 镜头表与提示词 | pipeline | 计划中 |
| 音乐 brief / 歌词 | `text.music_brief.generate` | MV idea、情绪、时长 | 音乐概念、歌词、节拍 | direct | 计划中 |

## Image Node

| Task | taskId | 输入 | 输出 | 策略 | 状态 |
| --- | --- | --- | --- | --- | --- |
| 人物底图 / 三视图 | `image.character.generate` | 角色档案、风格、比例 | 人物图或候选图 | direct | 已完成 |
| 道具资产 | `image.prop.generate` | 道具描述、风格 | 道具图 | direct | 已完成 |
| 场景资产 | `image.scene.generate` | 场景描述、风格 | 场景图 | direct | 已完成 |
| 人物 MV 造型图 | `image.character.look.generate` | 人物底图、MV 视觉造型 | 造型图 | direct | 计划中 |
| 分镜关键帧 / 构图 | `image.keyframe.generate` | 镜头表、人物、场景、参考图 | 关键帧 | pipeline | 计划中 |
| 一致性修复 / 图像编辑 | `image.edit` | 原图、修改指令、身份锚点 | 新版本图像 | direct | 计划中 |

## Audio Node

| Task | taskId | 输入 | 输出 | 策略 | 状态 |
| --- | --- | --- | --- | --- | --- |
| 音乐生成 | `audio.music.generate` | 音乐 brief、歌词、时长、情绪 | 音乐 Artifact | direct | 已完成 |
| 音乐编辑 / 翻唱 | `audio.music.edit` | 原音频、编辑目标、参考文本 | 新版本音频 | direct | 计划中 |

## Video Node

| Task | taskId | 输入 | 输出 | 策略 | 状态 |
| --- | --- | --- | --- | --- | --- |
| 图生视频 / 单镜头 | `video.clip.generate` | 关键帧、提示词、时长 | 视频片段或 Provider task reference | direct | 已完成 |
| 首尾帧视频 | `video.first_last_frame.generate` | 首帧、尾帧、镜头描述 | 视频片段 | direct | 计划中 |
| 参考引导视频 | `video.reference_guided.generate` | 参考图/视频、镜头提示词 | 视频片段 | direct | 计划中 |
| 延长 / 重生成 | `video.clip.extend` / `video.clip.regenerate` | 原视频、修改指令 | 新版本视频 | direct | 计划中 |
| 批量镜头生成 | `video.batch.generate` | 已批准镜头表、关键帧集合 | 可追踪片段集合 | pipeline | 计划中 |

## Shared Constraints

| 项目 | 约束 |
| --- | --- |
| Memory | Profile 只读取声明的项目、角色、MV、风格、音乐、镜头和已选资产上下文。 |
| Validation | 校验输出类型、结构、媒体引用、Provider 错误和任务状态；失败不删除上游 Artifact。 |
| One-click | 创建可见、可编辑的 `Text -> Image -> Audio -> Video` 确定性预设；每一步仍需显式 Task 与审批。 |
| Current gap | 通用 `node.taskId` 持久化、TaskRun/Artifact 数据库、对象存储、队列和预设编排尚未实现；`persisted=false` 必须如实显示。 |

## Later Phases

| Phase | 扩展 | 约束 |
| --- | --- | --- |
| Phase 2 | Asset Library、LoRA、3D 人物/世界适配器 | 扩展现有节点和 TaskProfile，不增加第五类创建节点。 |
| Phase 3 | 音色/风格化音乐、IP 运营助手、社区 | 发布、活动、审批等外部或高成本动作必须人工确认。 |
