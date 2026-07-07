# Product Description — AI Comic Drama & MV Creation Platform

## Product Goal

- Build the backend foundation for maintainability, scalability, and external use.
- Turn AI generation into modular, reusable production workflows.
- Connect the full pipeline: text → image → audio → video.
- Store generated assets for reuse across projects.
- Deliver a polished creative workspace, not a static mockup. The production UI component approach is selected in Feature 1 Web Design before detailed page implementation starts.
- Treat deleted static pages and deleted copied-component experiments as historical scaffolding only. New app-shell work should rebuild the interface deliberately from the selected component system.

## Core Workflow

1. User enters an MV world-view description.
2. Script node expands it into storyboard direction, character profiles, and concrete scene descriptions.
3. Asset nodes generate characters, outfits, props, accessories, and scenes.
4. Composition node merges characters and scenes into storyboard grids.
5. Audio node generates voice, narration, or singing from dialogue / lyrics.
6. Video node generates short clips from images and audio.
7. Export node assembles the final comic drama, MV, or short video.

## Main UI: Canvas Workflow

The main interface is not a homepage. It is an infinite visual canvas where each AI capability is a connectable node.

The canvas experience should clearly communicate entry, hover, selection, connection, generation, retry, success, and failure states. Route changes, panels, drawers, project cards, asset cards, task rows, and export readiness states should use purposeful feedback that clarifies hierarchy and state without hiding functionality.

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

**Input:** one MV world-view description with theme, character count, background, and mood
**Output:** storyboard direction with POV/shots, character profiles with appearance and wardrobe, concrete scene descriptions

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
- Web design foundation covering component selection, interface design, wireframing, shared app shell, and page-by-page implementation.
- Clear route and shell state for entry, workspace, canvas, assets, tasks, history, export, and account surfaces.
- Script-to-storyboard generation.
- Character, prop, and scene image generation.
- Character and scene asset libraries.
- Image composition into 9-grid storyboard.
- Dialogue / lyrics to audio.
- Image + audio to short video clip.
- Task status, retry, and result tracking.


## Success Criteria

- User can complete a full workflow from brief to video clip in one project.
- Each node supports edit, regenerate, select, and save.
- Generated assets can be reused across projects.
- Failed nodes can be retried without losing upstream results.
- The workflow can be extended with new nodes and models.
