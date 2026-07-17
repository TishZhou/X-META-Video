# Session Handoff

## Verified Now

- Repository root: `D:\X-META-Video`
- Feature 1 Web Design, Feature 2 Workflow Canvas Foundation, Feature 3 Script Node, Feature 5 Image Node, Feature 8 Audio Node, Feature 9 Video Node, and Feature 16 Agent Runtime Foundation are recorded as `passing`.
- Current active feature: Feature 16 Agent Runtime Foundation is accepted at 147/150 after two evaluator rounds.
- Next broader unfinished feature remains Feature 4 Storyboard Node unless the user selects another media/export task.

## Feature 16 Agent Runtime State

- Current Text, Image, Audio, and Video generation routes delegate node execution to `services/api/xmeta_api/agent_runtime`.
- Agent Runtime owns task contracts, seven current Task Profiles, registry lookup, scoped memory selection, Prompt compilation, bounded Runtime retry, typed result validation, and node handlers.
- The canvas graph remains user-authored. Agent Runtime does not add, remove, reconnect, or automatically run canvas nodes.
- All shipped Task Profiles use `retry_limit=0`, preserving existing provider-level retry behavior. The Runtime consumes nonzero limits and a focused test proves one bounded retry can recover from a transient failure.
- `EmptyProjectMemoryReader` is intentionally empty and non-durable. Future project memory must add approval, tenant/project scope, and exact asset-version enforcement.
- Script prompt and runner compatibility imports remain available from their previous module paths.
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
- This session did not change Feature 5 provider behavior.

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
