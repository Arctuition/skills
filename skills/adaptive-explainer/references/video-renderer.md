# HTML video renderer

Read when rendering an HTML scene. Use the bundled [render-video.mjs](../scripts/render-video.mjs); it needs Node 22.4+, Chrome/Chromium, and `ffmpeg`/`ffprobe` on `PATH`, with no npm dependencies. It renders local HTML in an isolated browser profile and removes its temporary frames afterward.

## Scene contract

Expose these properties on `window` from the scene file:

```js
window.videoConfig = {
  width: 1920,
  height: 1080,
  fps: 25,
  duration: 12, // seconds on the full timeline
  scenes: [
    { id: 'first-charge', start: 0, end: 4 },
    { id: 'lost-response', start: 4, end: 8 },
    { id: 'retry', start: 8, end: 12 },
  ],
};
// window.renderAt = (t) => { ... }; // t is seconds on that same timeline
// window.videoReady = preloadAssets(); // optional Promise for custom assets/data
```

Derive these values from the cue timeline used by `renderAt`; do not maintain a second set of scene times. Width and height must be positive even integers; fps must be a positive integer. Scene IDs are unique and their nonempty ranges lie within duration. Scenes can be omitted if no scene selection is needed.

`renderAt(t)` must assign the complete visible state for time `t`, including captions, without depending on previously rendered frames, wall-clock time, unseeded randomness, CSS transitions, or CSS animations. It may return a Promise. This lets a scene preview start in the middle of the full timeline correctly. Audio is supplied separately, not played by the page.

Use inline CSS/SVG and local assets. The renderer waits for page load, `videoReady` if present, fonts, and HTML image decoding; preload other resources such as CSS backgrounds and SVG image assets through `videoReady`. Do not fetch changing remote data during capture. Uncaught page errors or failed image decoding stop the render.

## Commands

`<SKILL_DIR>` is the installed skill directory containing this reference and `scripts/`. Render a representative scene first:

```bash
node "<SKILL_DIR>/scripts/render-video.mjs" \
  --html "<SCENE_HTML>" --output "<SAMPLE_MP4>" --scene "<SCENE_ID>"
```

Then render the full timeline:

```bash
node "<SKILL_DIR>/scripts/render-video.mjs" \
  --html "<SCENE_HTML>" --output "<VIDEO_MP4>"
```

For narration, add `--audio "<MIXED_AUDIO_FILE>"` to both commands. Supply the full mix starting at timeline zero even for a scene preview; the renderer trims audio and visuals to the same interval. Short audio is padded with silence; audio extending past the full video duration is rejected, allowing one frame for timing/codec rounding. Adjust the timeline instead of cutting off speech.

Optional flags: `--chrome "$CHROME"` to select a browser executable, `--scale 0.5` for a smaller draft, and `--overwrite` to replace an existing output after successful encoding and checks. Without `--chrome`, the script checks `$CHROME`, standard macOS Chrome, and Chrome/Chromium on `PATH`. Scaled dimensions must also be even integers.

Scene starts round to the nearest frame and ends round up; the output reports the actual interval. The last frame is one frame before the interval's end, so give the final state a hold rather than introducing it at `duration`.

The script encodes H.264 with the BT.709 matrix and color tags, and checks decoded frame count, output dimensions, duration, color tags, and presence or absence of audio. It does not judge explanation accuracy, readability, speech quality, or synchronization within the supplied mix; perform the checks in [explainer-video.md](explainer-video.md#verify).
