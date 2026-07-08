# Session Handoff

## Verified Now

- Repository root: `D:\X-META-Video`
- Feature 1 Web Design, Feature 2 Workflow Canvas Foundation, Feature 3 Script Node, Feature 5 self-contained image nodes, and Feature 9 Video Node are recorded as `passing`.
- Current active feature: Feature 8 Audio Node revision `text-to-music-audio-node-003` is now `passing` after live MiniMax generate-and-edit Browser E2E.
- Next broader unfinished feature remains Feature 4 Storyboard Node unless the user selects another media/export task.
- Feature 5 latest state: Character Image, Prop / Asset, and Scene Image generation entries have been collapsed into one self-contained Image node. It displays its own uploaded/generated image, can seed prompts from connected text, can generate prompt-only images, and can send prompt plus current image reference for SeedDream editing. It no longer creates separate image outcome nodes.

## Feature 8 Audio Node State

- Audio source nodes now render an empty audio state until audio media exists.
- Selecting an Audio source node opens the Script-style below-node composer.
- If no audio is present, the composer uses connected text as lyrics when available plus the inline natural-language music prompt, then calls the local FastAPI route: `POST /api/v1/projects/{project_id}/nodes/{node_id}/generate-audio`.
- Successful generation updates the selected Audio source node via local `output.media.kind=audio`; it no longer creates a separate Audio outcome node.
- The Audio source node renders browser `<audio controls>` with play/pause directly on the node.
- The Audio source node exposes a visible Download action for saving the current generated/uploaded local audio preview.
- Default Audio node test prompt/lyrics are intentionally short to reduce live MiniMax generation wait time during testing.
- Upload uses a local browser data URL only; it updates the selected Audio node preview and is not durable storage.
- If the selected Audio node already has generated or uploaded audio, the composer switches to Edit audio mode and calls local FastAPI with the current audio as a MiniMax `music-cover-free` reference, then replaces the selected source Audio node in place.
- MiniMax defaults now match the domestic free-tier request shape: `MINIMAX_BASE_URL=https://api.minimaxi.com/v1/music_generation`, `MINIMAX_MUSIC_MODEL=music-2.6-free`, `MINIMAX_MUSIC_COVER_MODEL=music-cover-free`, `MINIMAX_MUSIC_OUTPUT_FORMAT=hex`, sample rate `44100`, bitrate `256000`, format `mp3`.
- Real provider key remains gitignored in `.env`; no secret values were printed.

## Feature 5 Image Node State

- The Add menu exposes one Image generation node instead of separate Character Image, Prop / Asset, and Scene Image nodes.
- The Image source node renders an empty image placeholder until it has image media.
- Selecting the Image source node opens the Script-style below-node composer.
- If no image is present, the composer Generate button runs text-to-image against the local FastAPI SeedDream route.
- If the node already has a generated or uploaded image, the composer switches to Edit image and sends the prompt plus current image reference to the same local FastAPI SeedDream route.
- Upload uses a local browser data URL only; it updates the selected node preview and is not durable storage.
- Connected text is supported through the Image node prompt input; the editor shows `Use connected text` when a compatible upstream text edge exists.
- Successful generation/edit updates the selected source node via local `output.media.kind=image`; it does not upsert an image outcome node.
- The image editor model selector displays `SeedDream 5.0`.

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
- `.env` and `.env.example` include non-secret Audio settings:
  - `MUSIC_MODEL_PROVIDER=minimax`
  - `MINIMAX_BASE_URL=https://api.minimaxi.com/v1/music_generation`
  - `MINIMAX_API_KEY=`
  - `MINIMAX_HTTPS_PROXY=`
  - `MINIMAX_MUSIC_MODEL=music-2.6-free`
  - `MINIMAX_MUSIC_COVER_MODEL=music-cover-free`
  - `MINIMAX_MUSIC_OUTPUT_FORMAT=hex`
  - `MINIMAX_MUSIC_SAMPLE_RATE=44100`
  - `MINIMAX_MUSIC_BITRATE=256000`
  - `MINIMAX_MUSIC_FORMAT=mp3`
  - `MINIMAX_MUSIC_TIMEOUT_SECONDS`
  - `MINIMAX_MUSIC_MAX_RETRIES`
- Real provider secrets remain gitignored in `.env`; no secret values were printed.

## Verification Evidence

- Baseline `.\init.ps1` passed before Feature 5 self-contained implementation and reran web tests: 9 files / 52 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_image_node.py` passed: 10 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed: 52 tests.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 29 tests.
- `corepack pnpm --filter @xmeta/web test -- graph.test.ts` passed: 1 file / 7 tests.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 55 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- Follow-up unified Image node verification passed: focused workspace/graph tests 2 files / 36 tests, full web tests 9 files / 55 tests, web typecheck, web build with `/workspace`, JSON validation, Browser QA on `http://localhost:3000/workspace` confirming one Image Add-menu entry, no old image-generation entries, `SeedDream 5.0` in the model selector, no console warn/error logs, and final `.\init.ps1`.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Browser QA on `http://localhost:3000/workspace` with system Chrome passed: added Scene Image, verified empty image-node state and below-node composer, uploaded the provided PNG, saw one in-node image preview, zero image outcome nodes, local-upload provider evidence, Edit image mode, and Use connected text after connecting Script output to Scene Image input.
- Final `.\init.ps1` passed and reran web tests: 9 files / 55 tests.
- Feature 8 Audio revision evidence:
  - Baseline `.\init.ps1` passed before implementation and reran web tests: 9 files / 55 tests.
  - `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_music_node.py` passed: 8 tests.
  - `.\.venv\Scripts\python.exe -m ruff check services\api` passed.
  - `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx graph.test.ts` passed: 2 files / 38 tests.
  - `corepack pnpm --filter @xmeta/web typecheck` passed.
  - `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed: 52 tests.
  - `corepack pnpm --filter @xmeta/web test` passed: 9 files / 57 tests.
  - `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
  - Live FastAPI preflight with external network permission reached domestic MiniMax and returned provider `minimax`, model `music-2.6-free`, `audio/mpeg`, hex length `11255410`, duration `175804ms`, sample rate `44100`, and bitrate `256000`.
  - Browser E2E passed on `http://localhost:3000/workspace` with local FastAPI on 8000 and domestic MiniMax live provider: Add Audio, fill prompt/lyrics, Generate, backend evidence `minimax / music-2.6-free`, generated audio rendered on the source Audio node as native `<audio controls>`, data URL length `6000091`, duration `140.527166`, `readyState=4`, source node switched to Edit audio mode, and browser console warn/error logs were empty.
  - Final `.\init.ps1` passed after live E2E artifact updates and reran web tests: 9 files / 57 tests.
  - Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 57 tests.
  - Feature 8 Audio edit completion evidence:
    - Baseline `.\init.ps1` passed before implementation and reran web tests: 9 files / 57 tests.
    - `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_music_node.py` passed: 10 tests.
    - `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx graph.test.ts` passed: 2 files / 39 tests.
    - `corepack pnpm --filter @xmeta/web typecheck` passed.
    - `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed: 54 tests.
    - `.\.venv\Scripts\python.exe -m ruff check services\api` passed.
    - `corepack pnpm --filter @xmeta/web test` passed: 9 files / 58 tests.
    - `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
    - Browser E2E passed on `http://localhost:3000/workspace` with local FastAPI on 8000 and domestic MiniMax live provider: Add Audio, Generate via `music-2.6-free`, source node rendered playable controls and Download, Edit audio with prompt, backend evidence switched to `minimax / music-cover-free`, source data URL length changed from `7626231` to `7440103`, duration changed from `178.642721` to `174.27737`, `readyState=4`, old audio-edit not-implemented text absent, and browser console warn/error logs were empty.
    - Final `.\init.ps1` passed after artifact updates and reran web tests: 9 files / 58 tests.
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
- Live MiniMax execution for Feature 8 passed through domestic MiniMax using `music-2.6-free` for text-to-music and `music-cover-free` for existing-audio edit.
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
