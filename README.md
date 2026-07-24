# X-META Video

面向漫画剧、MV 与短视频创作的可视化 AI 工作流画布。创作者在画布上手动添加并连接节点，显式选择任务、检查中间结果，再决定是否继续生成；平台不会静默修改工作流、切换模型或触发后续付费生成。

## 当前可用能力

- **画布工作流**：连接 Text、Image、Audio、Video 四类创作节点，以及可编辑的 Data 输入/输出节点。
- **文本**：基于明确任务生成 IP 世界观、角色档案与 MV 造型文本；输出可编辑、可复用。
- **图像**：生成/上传/编辑角色、道具与场景图；角色基础图后的三视图与表情动作表需用户再次点击才会生成；支持把角色基础图与 MV 造型文本组合为角色 MV 造型图。
- **音频**：生成音乐、预览、下载，并在提供可用参考音频时执行封面/编辑模式。
- **视频**：以提示词和已连接的媒体引用提交视频生成，并展示可播放结果或 Provider 任务状态。
- **本地项目恢复**：画布元数据暂存于浏览器，本地媒体由 FastAPI 保存到项目范围的 `.xmeta-local-data` 目录，刷新后可恢复。

## 当前限制

这是本地开发阶段的实现，并非生产级云平台：尚未提供账户/RBAC、云同步、资产库、持久化任务队列、生成历史时间线、对象存储、视频任务轮询或导出。浏览器只请求本地 FastAPI；模型凭据始终留在服务端。未配置对应 Provider 密钥时，生成应明确失败或不可用，不能视为已完成生成。

## 架构边界

```text
Web canvas -> FastAPI -> Agent Runtime -> Provider adapter -> validated result
```

- `apps/web` 负责画布交互、显式任务选择、连接和预览，不保存模型密钥或直接调用模型服务。
- `services/api` 负责请求验证、运行时分派、Provider 凭据与模型调用。
- 当前本地媒体服务只负责单设备、项目范围的文件保存；它不是云端资产库。

完整边界和数据流见 [架构说明](docs/ARCHITECTURE.md)。

## 环境要求

- Node.js 20+
- pnpm 9+（也可由 Corepack 提供）
- Python 3.11+（运行 FastAPI 时需要）
- 可选：Docker Desktop，用于 PostgreSQL、Redis、MinIO 等目标基础设施
- 各模型 Provider 的有效服务端 API Key（仅在需要真实生成时）

## 快速开始

在仓库根目录执行标准初始化。它会安装前端依赖并运行 Web 测试：

```powershell
.\init.ps1
```

启动前端开发服务器：

```powershell
corepack pnpm dev
```

默认访问地址为 `http://localhost:3000`。前端默认请求本地 API `http://localhost:8000/api/v1`。

如需启动 API，请在另一终端执行：

```powershell
Set-Location services/api
python -m pip install -e ".[dev]"
uvicorn xmeta_api.main:app --reload --port 8000
```

## 环境变量与密钥

不要提交或展示本地 `.env`。以根目录的 [`.env.example`](.env.example) 为服务端配置模板，并按需复制 `apps/web/.env.example` 为前端本地配置。真实文本、图像、音频或视频生成需要在本地环境中填入对应 Provider 的密钥，例如 `TEXT_MODEL_API_KEY`、`DOUBAO_API_KEY`、`MINIMAX_API_KEY` 或 `ARK_API_KEY`。

`X_META_LOCAL_MEDIA_ROOT` 控制本地项目媒体目录，默认值为 `.xmeta-local-data`；该目录不应被当作云端持久化。

## 常用命令

```powershell
# 前端开发与质量检查
corepack pnpm dev
corepack pnpm test
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build

# Python API 测试（在 services/api 目录）
pytest
```

## 仓库结构

```text
apps/web/                  Next.js 画布应用
services/api/              FastAPI、Agent Runtime 与本地媒体边界
packages/shared-contracts/ 前后端共享契约
docs/                      产品、架构、API 与设计文档
feature_tasks/             功能任务与验收状态
init.ps1                   标准初始化与前端测试入口
```

## 文档

- [产品说明](docs/PRODUCT.md)
- [架构与边界](docs/ARCHITECTURE.md)
- [当前 API 契约](docs/API.md)
- [节点设计](docs/node_design.md)
- [功能状态](feature_list.json)

## 开发原则

任务选择、节点连接和派生媒体生成必须由用户可见、可编辑的操作触发。Provider 调用只经由本地 FastAPI；缺失的后端、持久化或 Provider 能力必须在界面与文档中如实标注。
