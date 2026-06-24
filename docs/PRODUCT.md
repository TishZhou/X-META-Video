# Product Description — AI Comic Drama & MV Creation Platform

## Product Goal

- Build the backend foundation for maintainability, scalability, and external use.
- Turn AI generation into modular, reusable production workflows.
- Connect the full pipeline: text → image → audio → video.
- Store generated assets for reuse across projects.

## Core Workflow

1. User enters a creative brief.
2. Script node generates plot, storyboard, dialogue / lyrics, camera movement, and character profiles.
3. Asset nodes generate characters, outfits, props, accessories, and scenes.
4. Composition node merges characters and scenes into storyboard grids.
5. Audio node generates voice, narration, or singing from dialogue / lyrics.
6. Video node generates short clips from images and audio.
7. Export node assembles the final comic drama, MV, or short video.

## Main UI: Canvas Workflow

The main interface is not a homepage. It is an infinite visual canvas where each AI capability is a connectable node.

```txt
[Script] → [Storyboard] → [Character Image]
              ↓              ↓
         [Scene Image] → [Image Composition]
                              ↓
            [Audio]      → [Video]
                              ↓
                           [Export]
```

## Node Types

### Script Node

**Input:** creative brief, IP setting, style, theme, duration  
**Output:** plot summary, storyboard, dialogue / lyrics, camera movement, character profiles

### Character Image Node

**Input:** gender, personality, appearance, outfit, accessories  
**Output:** character image, full-body front view, saved character asset

### Prop / Asset Node

**Input:** prop or object description  
**Output:** prop image, saved asset

### Scene Image Node

**Input:** scene description and visual style  
**Output:** background image

### Image Composition Node

**Input:** character asset, scene asset, storyboard info  
**Output:** character-in-scene image, 9-grid storyboard

### Audio Node

**Input:** dialogue, lyrics, narration  
**Output:** voice, singing, or narration audio

### Video Node

**Input:** image grid, keyframes, audio, duration  
**Output:** Seedance video clip

### Export Node

**Input:** selected clips and audio  
**Output:** final comic drama, MV, or short video

## Asset Library

- Character Library
- Scene Library
- Prop Library
- Audio Library
- Video Clip Library

Each asset stores its source prompt, model, parameters, version, generation time, and project link.

## Backend Foundation

- **Model Gateway:** unified access to text, image, audio, and video models.
- **Workflow Engine:** manages node dependencies, inputs, outputs, and execution order.
- **Task Queue:** handles async generation, concurrency, retries, and timeouts.
- **Asset Service:** stores, retrieves, and reuses generated assets.
- **Project Service:** manages projects, storyboards, versions, and history.
- **Observability:** tracks logs, errors, latency, and model status.

## MVP Scope

- Canvas-based node editor.
- Script-to-storyboard generation.
- Character, prop, and scene image generation.
- Character and scene asset libraries.
- Image composition into 9-grid storyboard.
- Dialogue / lyrics to audio.
- Image + audio to short video clip.
- Task status, retry, and result tracking.

## Constraints

- AI generation must run asynchronously.
- External model quality and speed affect output.
- Character consistency is a key quality risk.
- Existing 9-grid capability should be reused first.
- Asset source and usage rights must be recorded.
- Auto-editing, subtitles, transitions, and audio-video alignment are future features.

## Success Criteria

- User can complete a full workflow from brief to video clip in one project.
- Each node supports edit, regenerate, select, and save.
- Generated assets can be reused across projects.
- Failed nodes can be retried without losing upstream results.
- The workflow can be extended with new nodes and models.
