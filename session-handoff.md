# Session Handoff

## Verified Now

- `docs/node_design.md` is the concise implementation-facing companion to Product and Architecture. It maps the IPMV workflow onto the same four creation Node kinds, records current versus planned Task IDs, and establishes Node Task selection, TaskRun, Artifact, MemoryScope, Validator, preset, and human-control boundaries. It is accepted at 149/150; voice/style generation stays Phase 3 and target-only Runtime fields are identified as such.

- The Phase 1 product/runtime documentation is accepted at 146/150. Product defines exactly four creation Node kinds and Architecture records the Router, Runtime, Task Profile, executor, provider, validator, TaskRun, Memory, Artifact, and persistence boundaries while distinguishing current implementation from target behavior.

- Image Task 1 model output is passing: the task combines appearance and personality/action into a server-side `character_image` request and renders the live returned media in a downstream pure Data node. The image itself has no visible card/image border and is shown uncropped at its original aspect ratio; source/result ports and their one automatic edge remain visible. Browser E2E produced a real `doubao-seedream / doubao-seedream-5-0-260128` result at 5 nodes / 3 edges. Full Web 70 tests, API/Runtime 27 tests, Ruff, typecheck, production build, `init.ps1`, and diff check passed; independent evaluation accepted 157/160.

- Canvas viewport stability is passing: `/workspace` initializes its fitted graph viewport only on mount. Later window or visual-viewport resizes update responsive editor layout without resetting canvas pan/zoom. In-app Browser Task 1 E2E ended at 5 nodes / 3 edges with the Image source-to-result line and supplied local preview visible; console logs were empty. Web 70 tests, typecheck, production build, `init.ps1`, and diff check passed; independent evaluation accepted at 158/160.

- Repository root: `D:\X-META-Video`
- Feature 1 Web Design, Feature 2 Workflow Canvas Foundation, the previously accepted Feature 3 Script baseline, Feature 5 Image Node, Feature 8 Audio Node, Feature 9 Video Node, and Feature 16 Agent Runtime Foundation remain recorded as `passing`.
- Feature 3 `text-node-task-3-mv-look-development-v1` is `passing`. Automated verification, live-provider execution, Codex in-app Browser E2E, and independent evaluation all passed; the final score is 147/160.
- Feature 2 `general-data-source-node-v1` is `passing` at 151/160. Data source nodes provide editable local text as compatible `brief` input; Image/Audio are deliberately disabled until file attachment support is implemented.
- Feature 5 `image-node-character-base-task-v1` is `passing` at 160/160. Image Task 1 collects character appearance plus personality/action text, then uses the supplied `provided-character-base-task-1.png` only as a clearly labeled local, non-persisted preview in one automatic source-to-result edge; it makes no provider-generation claim.
- No Computer Use, Chrome, or standalone Playwright was used. The verified workspace remains open in the Codex in-app Browser as the deliverable tab.

## Feature 3 Text Node Task Choice State

- Visible Text nodes keep the internal workflow type `script` for compatibility and expose exactly three node-local tasks through a shadcn Select.
- Task 1 `ip_worldview` expands a brief into IP/narrative positioning, world rules/dimensions, and named character positioning; it returns an editable `script` outcome.
- Task 2 `character_profiles` consumes connected Task 1, then same-node Task 1, then manual text. It returns an editable natural-language `character` outcome covering appearance, personality/action, and voice/timbre without requiring JSON, fixed labels, or delimiter tags.
- Task 3 `mv_look_development` consumes separate manual `character_profile` and `mv_brief` text, then returns an editable `mv_look` outcome. It preserves stated identity anchors and proposes MV-specific outfit/styling, silhouette, materials/palette, hair/makeup, and only contextually useful accessories; it does not claim an image, face-lock result, asset, or persistence.
- Generate uses `POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-text`; `/chat` remains only for unchanged AI modify/dialogue behavior.
- One canonical editable `content` value drives both the user-visible result and downstream transfer. Compact metadata carries task, data type, source, prompt-template, provider, and model without duplicating the long text.
- Deleted outcome nodes are not valid cached sources. Task 1 and Task 2 results use separate non-overlapping canvas positions.
- Automated evidence: focused Text API 8/8; full API 80/80; Ruff; focused jsdom interaction; full Web 10 files / 63 tests; typecheck; build; JSON; diff; docs truth search; typed OpenAPI; and final `init.ps1` passed.
- Live Codex Browser evidence: `openai / gpt-5.4-mini`; Task 1 generated and remained editable, Task 2 visibly used the same-node Task 1 outcome, and the successful retry returned 1,651 free-form characters with Mira, Luna, Iris, and Zora plus appearance, personality/action, and voice/timbre content. Both outcomes were editable, provider-labelled, and non-overlapping; viewport screenshots and console logs passed.
- Independent evaluation: Round 1 126/160; Round 2 143/160 but Browser-blocked; Revision 3/4 final 156/160 and accepted with no blocking defect.
- Next best step: begin the next node vertical while reusing the shared Text generation contract and keeping task-specific behavior in Agent Runtime profiles.

## Feature 16 Agent Runtime State

- Current Text, Image, Audio, and Video generation routes delegate through `services/api/xmeta_api/agent_runtime/runtime.py`.
- `runtime.py` is the unified facade; Text, Image, Audio, and Video execution lives separately in `nodes/text.py`, `nodes/image.py`, `nodes/audio.py`, and `nodes/video.py`.
- Old `agent_runtime/handlers.py`, `xmeta_api/prompt.py`, and `xmeta_api/runner.py` compatibility modules are deleted. Future code must import the final module paths directly.
- Agent Runtime owns task contracts, ten current Task Profiles, registry lookup, scoped memory selection, Prompt compilation, bounded Runtime retry, typed result validation, and node executors.
- The canvas graph remains user-authored. Agent Runtime does not add, remove, reconnect, or automatically run canvas nodes.
- All shipped Task Profiles use `retry_limit=0`, preserving existing provider-level retry behavior. The Runtime consumes nonzero limits and a focused test proves one bounded retry can recover from a transient failure.
- `EmptyProjectMemoryReader` is intentionally empty and non-durable. Future project memory must add approval, tenant/project scope, and exact asset-version enforcement.
- Deleted Script prompt, runner, and handler compatibility paths remain absent; future code imports only the final Agent Runtime modules.
- Provider payload construction, credentials, supported models, parsing, and provider retries remain in `xmeta_api/providers.py`.
- No frontend files or public FastAPI route/request/response contracts changed.

## Feature 9 Video Node State

- Video source nodes now have prompt, image, reference video, audio, and output ports.
- Prompt accepts connected `script`, `storyboard`, or `brief`; image accepts `image`, `character`, `scene`, or `asset`; reference video accepts `video`; audio accepts `audio`.
- Selecting a Video source node opens the Video generation editor. Users can edit prompt and duration, then click Generate.
- The web app calls only the local FastAPI route: `POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-video`.
- Frontend request body uses the local shape:

```json
{
  "node_type": "video",
  "input": {
    "prompt": "Cinematic MV clip...",
    "duration": 15,
    "image_urls": ["https://image.example/keyframe.png"],
    "video_urls": ["https://video.example/reference.mp4"],
    "audio_urls": ["https://audio.example/music.mp3"]
  }
}
```

- Backend validates duration, max 9 images, max 3 reference videos, max 3 audio clips, and rejects audio unless at least one image or video reference exists.
- Backend provider path is Volcengine Ark Seedance through raw HTTP:
  - `submitArkSeedanceVideoWithRetry()` -> `submitArkSeedanceVideoGenerationOnce()`
  - Endpoint: `{ARK_BASE_URL}/contents/generations/tasks`, with `/api/v3` added when needed.
  - Model default: `doubao-seedance-2-0-mini-260615`
  - Payload fields: `model`, `content`, `generate_audio`, `ratio`, `duration`, `watermark`
  - `image_urls`, `video_urls`, and `audio_urls` map to `reference_image`, `reference_video`, and `reference_audio`.
- Successful URL responses create/update one deterministic `Video outcome` node with one `video` output port, backend provider/model evidence, a `<video controls>` preview, and local-preview/no-persistence labeling.
- If Ark returns only a provider task ID and no playable URL, the UI labels task polling as not implemented instead of implying playback is ready.

## Feature 8 Audio Node State

- Audio source nodes generate or upload playable audio directly on the selected Audio node.
- Existing audio switches the composer into Edit audio mode and calls local FastAPI with the current audio as a MiniMax `music-cover-free` reference.
- MiniMax defaults: `MINIMAX_BASE_URL=https://api.minimaxi.com/v1/music_generation`, `MINIMAX_MUSIC_MODEL=music-2.6-free`, `MINIMAX_MUSIC_COVER_MODEL=music-cover-free`, `MINIMAX_MUSIC_OUTPUT_FORMAT=hex`, sample rate `44100`, bitrate `256000`, format `mp3`.
- This session did not change Feature 8 provider behavior.

## Feature 5 Image Node State

- The Add menu exposes one Image generation node instead of separate Character Image, Prop / Asset, and Scene Image nodes.
- The Image source node can generate from prompt-only SeedDream, upload a local image, or edit current image plus prompt through the local FastAPI SeedDream route.
- The image editor model selector displays `SeedDream 5.0`.
- Image Task 1 `character_base_image` adds node-local Text-style character appearance and personality/action inputs. Completing it creates/updates exactly one `Character base image result` connected from the selected Image source. The supplied PNG is labeled `Provided local preview`; it is neither a provider generation nor an asset-library persistence implementation. Prompt, Upload, and Generate controls remain unchanged for the existing task.

## Environment

- `.env` and `.env.example` include non-secret Video settings:
  - `VIDEO_MODEL_PROVIDER=volcengine-ark`
  - `ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3`
  - `ARK_API_KEY=`
  - `ARK_VIDEO_MODEL=doubao-seedance-2-0-mini-260615`
  - `ARK_VIDEO_RATIO=16:9`
  - `ARK_VIDEO_GENERATE_AUDIO=true`
  - `ARK_VIDEO_WATERMARK=false`
  - `ARK_VIDEO_TIMEOUT_SECONDS=240`
  - `ARK_VIDEO_MAX_RETRIES=1`
- Real provider secrets remain gitignored in `.env`; no secret values were printed.
- `ARK_API_KEY` is still empty locally, so live Ark execution was not attempted.

## Verification Evidence

- Four-Node documentation source cross-check, legacy taxonomy and encoding searches, JSON validation, and `git diff --check` passed.
- Final documentation startup verification passed with 10 Web files / 70 tests; independent evaluator accepted at 146/150.

- Final migration exact import search returned zero active references to the deleted compatibility modules; fresh-process module discovery returned `None` for all three paths.
- Final migration Agent Runtime focused pytest passed 17 tests; full API pytest passed 72 tests; Ruff passed; Web passed 9 files / 58 tests.
- JSON validation, diff check, local Uvicorn/OpenAPI and Script route smoke, and final `./init.ps1` passed.
- Independent evaluator accepted final compatibility cleanup at 149/150.

- Agent Runtime node split focused pytest passed: 17 tests.
- Full API pytest passed: 72 tests; Ruff passed.
- Full web tests passed: 9 files / 58 tests.
- JSON validation, full `git diff --check`, local Uvicorn/OpenAPI smoke, and final `./init.ps1` passed.
- Independent evaluator accepted the node split at 148/150.

- Feature 16 Agent Runtime focused pytest passed: 15 tests.
- Full API pytest passed: 70 tests; Ruff passed.
- Full web tests passed: 9 files / 58 tests.
- JSON validation and full `git diff --check` passed.
- Live local Uvicorn smoke returned OpenAPI 200 with 8 paths and a truthful missing-config 503.
- Final `./init.ps1` passed and reran 9 web test files / 58 tests.
- Independent evaluator round 2 accepted Feature 16 at 147/150.

- Baseline `.\init.ps1` passed before implementation and reran web tests: 9 files / 58 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_video_node.py` passed: 10 tests.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx graph.test.ts` passed: 2 files / 39 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed: 55 tests.
- `.\.venv\Scripts\python.exe -m ruff check services\api` passed.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 58 tests.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Browser E2E passed on `http://localhost:3000/workspace`: Add Video showed the new `Reference video` input label, the editor showed Ark Seedance and `0 reference videos`, Generate posted only to local FastAPI with `video_urls: []`, task-id-only response rendered provider task evidence without a video player, and console warn/error logs were empty.
- Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 58 tests.

## Boundaries

- Live Doubao/SeedDream execution was not attempted in this session.
- Live MiniMax execution was not repeated in this session.
- Live Ark execution was not attempted because `ARK_API_KEY` is empty.
- Durable workflow persistence, object storage, signed URLs, queue workers, provider task polling, Asset Library, Video Library, generation history, and export assembly remain later scope.

## Next Commands

- Startup: `.\init.ps1`
- Backend tests: `.\.venv\Scripts\python.exe -m pytest services\api\tests`
- Backend lint: `.\.venv\Scripts\python.exe -m ruff check services\api`
- Web test: `corepack pnpm --filter @xmeta/web test`
- Web typecheck: `corepack pnpm --filter @xmeta/web typecheck`
- Web build: `corepack pnpm --filter @xmeta/web build`
