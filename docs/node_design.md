# Node Design（Phase 1）

## 范围

Phase 1 只有四种创建 Node：`Text`、`Image`、`Audio`、`Video`。Node 表示媒体能力，Task 表示该 Node 当前执行的明确业务动作；人物、分镜、场景、造型和音乐不是新的 Node 类型。

下表的“已完成”只表示当前前端可选择并有对应 API 执行路径的用户 Task；Runtime 内部存在 Profile 不等于 UI 功能已经完成。“计划中”Task 在实现并验证前不得显示为可执行。

## Text Node

| Task | 任务标识 | 输入 | 输出 | 状态 |
| --- | --- | --- | --- | --- |
| IP 世界观 | `text.ip_worldview.generate` | 创意、题材、受众 | 世界观、角色定位、视觉规则 | 已完成 |
| 角色档案 | `text.character_profiles.generate` | 世界观与角色要求 | 外貌、性格、关系、声线描述 | 已完成 |
| MV 视觉造型 | `text.mv_look_development.generate` | 角色档案、MV brief | 服装、妆发、形体与身份锚点 | 已完成 |
| 分镜与歌词 | `text.storyboard_lyrics.generate` | MV idea、已批准角色资料、已批准视觉资料 | 结构化镜头表、音乐概念与歌词 | 计划中 |

`text.script.generate` 和 `text.script.dialogue` 是当前 Runtime 的内部/历史执行能力，不作为用户可选 Text Task。

## Image Node

| Task | 任务标识 | 输入 | 输出 | 状态 |
| --- | --- | --- | --- | --- |
| 提示词生成与编辑 | `prompt_generation`（当前兼容任务标识，尚未映射通用稳定 taskId） | 提示词、连接文本、可选当前图 | 单张本地图片预览 | 已完成（兼容） |
| 角色设定包 | `image.character.generate` | 人物外貌、性格与动作要求 | 角色底图、标准三视图、表情/动作设定集 | 已完成 |
| MV 人物造型图 | `image.character.look.generate` | 已批准角色设定包、MV 视觉造型 | 角色 MV 造型图 | 计划中 |

`prompt_generation` 在迁移到通用 `node.taskId` 并完成 Runtime 映射后，才能成为稳定 TaskId。

Runtime 中的 `image.prop.generate` 和 `image.scene.generate` Profile 不是当前 UI 已完成 Task，不在用户 Task 表中展示。

## Audio Node

| Task | 任务标识 | 输入 | 输出 | 状态 |
| --- | --- | --- | --- | --- |
| 音乐生成与编辑 | `audio.music.generate` | 音乐描述、歌词；编辑模式可附已有音频与修改要求 | 可播放音乐结果及 Provider/Model 信息 | 已完成 |

生成与已有音频的 cover/edit 是同一用户 Task 的两种输入模式，不拆成第二个 Task ID。

## Video Node

| Task | 任务标识 | 输入 | 输出 | 状态 |
| --- | --- | --- | --- | --- |
| 镜头生成 | `video.clip.generate` | 镜头 Prompt、时长；可附参考图、参考视频与参考音频 | 可播放视频片段，或明确标注的 Provider task reference | 已完成 |

## 通用约束

- 用户手动画布时显式选择 Task；Agent 不得自行更换 `taskId`、修改连线、选择付费模型或增加生成数量。
- 一键生成是可见、可编辑的确定性 Workflow Preset，仍由明确 Node、Task、Edge 和审批点组成。
- Node 输入和结果以 Data/Artifact 表示；Data 不是第五种创建 Node，下游应引用准确 Artifact 版本。
- TaskProfile 定义能力，TaskRun 记录单次执行，Artifact 保存版本化结果；三者不得混用。
- 未实现、缺少 Provider 配置、仅返回 Provider task reference 或 `persisted=false` 的结果必须如实显示。

## 当前与目标边界

当前前端仍在迁移到通用 `node.taskId` 工作流状态，媒体结果尚未形成统一的持久化 TaskRun/Artifact。TaskService、数据库、对象存储、队列 Worker 和一键 Preset 调度仍是目标能力，不得在 UI 中暗示已经上线。

Phase 2 的 Asset Library、LoRA 和 3D 适配器，以及 Phase 3 的音乐/音色模型、IP 运营助手和社区能力，应扩展现有 Node Task 或平台服务，不新增第五种创建 Node；发布、运营和高成本动作保持人工确认。
