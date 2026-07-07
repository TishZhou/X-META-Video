# Session Handoff

## Verified Now

- Repository root: `D:\X-META-Video`
- Feature 1 Web Design, Feature 2 Workflow Canvas Foundation, Feature 3 Script Node, Feature 5 text-to-image nodes, Feature 8 Audio Node, and Feature 9 Video Node are recorded as `passing`.
- Current active feature: none.
- Next broader unfinished feature remains Feature 4 Storyboard Node unless the user selects another media/export task.
- Feature 5 UI follow-up: the Image node AI editor now uses the Script below-node inline composer pattern and no longer uses the older right-side draggable/resizable floating image editor.

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

- Baseline `.\init.ps1` passed before implementation and reran web tests: 9 files / 48 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests\test_video_node.py` passed: 9 tests.
- `.\.venv\Scripts\python.exe -m pytest services\api\tests` passed: 50 tests.
- `.\.venv\Scripts\python.exe -m ruff check services\api` passed.
- `corepack pnpm --filter @xmeta/web test -- workflow-canvas-workspace.test.tsx` passed: 1 file / 26 tests.
- `corepack pnpm --filter @xmeta/web test` passed: 9 files / 51 tests.
- `corepack pnpm --filter @xmeta/web typecheck` passed.
- `corepack pnpm --filter @xmeta/web build` passed and included `/workspace`.
- Playwright Chrome E2E passed on `http://localhost:3000/workspace` with the video backend route intercepted: Add Video, Generate, one Video outcome, one video player, backend evidence, no-persistence label, and no console errors.
- Image node UI follow-up passed: focused workspace test 1 file / 26 tests, full web tests 9 files / 51 tests, web typecheck, web build with `/workspace`, and Browser QA on `http://127.0.0.1:3002/workspace` confirmed the Image Composition editor renders below the selected node inside the canvas stage with no floating image drag/resize controls and no console warn/error logs.

## Boundaries

- Live Evolink execution was not attempted because `EVOLINK_API_KEY` is empty.
- Durable workflow persistence, object storage, signed URLs, queue workers, provider task polling, Video Library, generation history, and export assembly remain later scope.
- Feature 5 image and Feature 8 audio behavior are preserved and passing.

## Next Commands

- Startup: `.\init.ps1`
- Backend tests: `.\.venv\Scripts\python.exe -m pytest services\api\tests`
- Backend lint: `.\.venv\Scripts\python.exe -m ruff check services\api`
- Web test: `corepack pnpm --filter @xmeta/web test`
- Web typecheck: `corepack pnpm --filter @xmeta/web typecheck`
- Web build: `corepack pnpm --filter @xmeta/web build`
