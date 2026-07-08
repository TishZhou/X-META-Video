# Session Handoff

## Verified Now

- Repository root: `D:\X-META-Video`
- Feature 1 Web Design, Feature 2 Workflow Canvas Foundation, Feature 3 Script Node, Feature 5 self-contained image nodes, Feature 8 Audio Node, and Feature 9 Video Node are recorded as `passing`.
- Current active feature: none.
- Next broader unfinished feature remains Feature 4 Storyboard Node unless the user selects another media/export task.
- Feature 5 latest state: Character Image, Prop / Asset, and Scene Image are self-contained image nodes. They display their own uploaded/generated image, can seed prompts from connected text, can generate prompt-only images, and can send prompt plus current image reference for SeedDream editing. They no longer create separate image outcome nodes.

## Feature 5 Image Node State

- Character Image, Prop / Asset, and Scene Image source nodes render an empty image placeholder until they have image media.
- Selecting one of these image source nodes opens the Script-style below-node composer.
- If no image is present, the composer Generate button runs text-to-image against the local FastAPI SeedDream route.
- If the node already has a generated or uploaded image, the composer switches to Edit image and sends the prompt plus current image reference to the same local FastAPI SeedDream route.
- Upload uses a local browser data URL only; it updates the selected node preview and is not durable storage.
- Connected text is supported:
  - Character and Scene already accepted Script-compatible inputs.
  - Prop / Asset now accepts `brief` or `script`.
  - The editor shows `Use connected text` when a compatible upstream text edge exists.
- Successful generation/edit updates the selected source node via local `output.media.kind=image`; it does not upsert an image outcome node.

## Feature 5 Backend/API State

- The web app still calls only:

```txt
POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-image
```

- Request body now supports optional reference image fields:

```json
{
  "node_type": "scene_image",
  "input": {
    "prompt": "Make this scene snowy.",
    "reference_image_url": "data:image/png;base64,...",
    "reference_image_b64": null,
    "reference_image_mime_type": "image/png"
  }
}
```

- Backend provider path remains Doubao SeedDream through `submitSeedreamWithRetry()` -> `submitSeedreamGenerationOnce()`.
- Provider payload includes the reference image as SeedDream `image` when present.
- Frontend never calls Doubao directly and never receives provider credentials.

## Feature 9 Video Node State

- Video source nodes now have prompt, image, audio, and output ports. Prompt accepts connected `script`, `storyboard`, or `brief`; image accepts `image`, `character`, `scene`, or `asset`; audio accepts `audio`.
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
    "audio_urls": ["https://audio.example/music.mp3"]
  }
}
```

- Backend validates duration, max 9 images, max 3 audio clips, and rejects audio without at least one image.
- Backend provider path is Evolink Seedance:
  - Image/reference path model: `seedance-2.0-reference-to-video`
  - Prompt-only fallback model: `seedance-2.0-text-to-video`
  - Provider request posts to `{EVOLINK_BASE_URL}/videos/generations`
- Successful responses create/update one deterministic `Video outcome` node with one `video` output port, backend provider/model evidence, a `<video controls>` preview, and local-preview/no-persistence labeling.
- If Evolink returns only a provider task ID and no playable URL, the UI labels task polling as not implemented instead of implying playback is ready.

## Environment

- `.env` and `.env.example` include non-secret Image settings:
  - `IMAGE_MODEL_PROVIDER=doubao-seedream`
  - `DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com`
  - `DOUBAO_API_KEY=`
  - `DOUBAO_HTTPS_PROXY=`
  - `SEEDREAM_MODEL=doubao-seedream-5-0-260128`
  - `SEEDREAM_SIZE=2K`
  - `SEEDREAM_RESPONSE_FORMAT=url`
  - `SEEDREAM_WATERMARK=false`
  - `SEEDREAM_TIMEOUT_SECONDS`
  - `SEEDREAM_MAX_RETRIES`
- `.env` and `.env.example` include non-secret Video settings:
  - `VIDEO_MODEL_PROVIDER=evolink`
  - `EVOLINK_BASE_URL=https://api.evolink.ai/v1`
  - `EVOLINK_API_KEY=`
  - `EVOLINK_VIDEO_MODEL=seedance-2.0-reference-to-video`
  - `EVOLINK_TEXT_TO_VIDEO_MODEL=seedance-2.0-text-to-video`
  - `EVOLINK_VIDEO_QUALITY=720p`
  - `EVOLINK_VIDEO_ASPECT_RATIO=16:9`
  - `EVOLINK_GENERATE_AUDIO=true`
  - `EVOLINK_VIDEO_TIMEOUT_SECONDS`
  - `EVOLINK_VIDEO_MAX_RETRIES`
- Real provider secrets remain gitignored in `.env`; no secret values were printed.

## Verification Evidence

- Baseline `.\init.ps1` passed before Feature 5 self-contained implementation and reran web tests: 9 files / 52 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_image_node.py` passed: 10 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed: 52 tests.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 29 tests.
- `corepack pnpm --filter @xmeta/web test -- graph.test.ts` passed: 1 file / 7 tests.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 55 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Browser QA on `http://localhost:3000/workspace` with system Chrome passed: added Scene Image, verified empty image-node state and below-node composer, uploaded the provided PNG, saw one in-node image preview, zero image outcome nodes, local-upload provider evidence, Edit image mode, and Use connected text after connecting Script output to Scene Image input.
- Final `.\init.ps1` passed and reran web tests: 9 files / 55 tests.
- Previous Feature 9 evidence remains:
  - Baseline `.\init.ps1` passed before implementation and reran web tests: 9 files / 48 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_video_node.py` passed: 9 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed: 50 tests.
- `.\.venv\Scripts\python.exe -m ruff check services\api` passed.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 26 tests.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 51 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Playwright Chrome E2E passed on `http://localhost:3000/workspace` with the video backend route intercepted: Add Video, Generate, one Video outcome, one video player, backend evidence, no-persistence label, and no console errors.
- Earlier image node inline-composer follow-up passed: focused workspace test 1 file / 26 tests, full web tests 9 files / 51 tests, web typecheck, web build with `/workspace`, and Browser QA on `http://127.0.0.1:3002/workspace` confirmed the Image Composition editor rendered below the selected node inside the canvas stage with no floating image drag/resize controls and no console warn/error logs.

## Boundaries

- Live Doubao/SeedDream execution was not attempted because `DOUBAO_API_KEY` is empty.
- Live Evolink execution was not attempted because `EVOLINK_API_KEY` is empty.
- Durable workflow persistence, object storage, signed URLs, queue workers, provider task polling, Asset Library, Video Library, generation history, and export assembly remain later scope.
- Feature 5 image, Feature 8 audio, and Feature 9 video behavior are preserved and passing.

## Next Commands

- Startup: `.\init.ps1`
- Backend tests: `.\.venv\Scripts\python.exe -m pytest services\api\tests`
- Backend lint: `.\.venv\Scripts\python.exe -m ruff check services\api`
- Web test: `corepack pnpm --filter @xmeta/web test`
- Web typecheck: `corepack pnpm --filter @xmeta/web typecheck`
- Web build: `corepack pnpm --filter @xmeta/web build`
