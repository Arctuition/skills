# Explainer video

Use when motion itself carries the information (continuous change, spatial transformation, a process the reader must watch unfold) or when the user asked for a video. For staged change, a stepper inside an HTML page is the default; a video is the escalation, not the starting point.

The model writes the program that renders the video; it does not emit video. Everything below depends on tools present on the machine.

## Check the toolchain first

Check only the selected path. For an HTML renderer on macOS:

```bash
command -v ffmpeg ffprobe node
ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

- Frames: use installed `manim` for math or algorithm animation, or one HTML scene file with headless Chrome. For other platforms, locate the installed browser rather than assuming the macOS path.
- Narration is optional. Honor the user's choice of captions only, local speech, an authorized cloud TTS, or a supplied recording. For macOS speech, check `command -v say` and list installed voices with `say -v '?'`. A missing optional tool does not block another usable path.
- Assembly and inspection: `ffmpeg` and `ffprobe`. If rendering cannot be completed, explain the missing prerequisite and deliver the storyboard plus an HTML stepper as substitutes.

Carry forward existing authorization for installations and cloud processing. Ask only when a necessary action exceeds that scope; do not ask again for an already selected service or voice. Authorization for TTS does not automatically authorize sending the audio to a separate transcription service.

## Budget and write the script for the ear

Set the target length before drawing anything. For synthesized narration, use a short representative sample from the selected voice to estimate the draft's duration; for a supplied recording, measure its duration directly. Reserve time for pauses and inspecting the visuals. Use measured clip durations for the final timeline; character or word counts are drafting estimates, not timing guarantees. For captions only, budget reading and visual inspection time without a speech pipeline.

- A cue pairs a spoken clause or caption with the visual change it explains. Reuse cue identifiers across variants where the meaning stays the same; adapt the cues when a different audience needs a different explanation.
- Write speech so its meaning does not depend on visible punctuation or symbols. Check ambiguous terms and product names in the sample; captions can retain their exact spelling.
- Write in the audience's vocabulary. For users, take terms and button names from their docs and UI and speak to "you"; drop internal identifiers. A new audience is a rewrite, not a translation.
- Check every product label drawn on screen against the source or the running UI. An invented button name means a re-render. Label example data on screen.

## Storyboard before rendering

Write a storyboard table first: scene number, what is on screen, the caption or narration per cue, and seconds. Use one idea per scene and fit the requested duration; when none is given, aim for a short explanation, usually 20 to 90 seconds. Narrow the content before exceeding a requested limit. Get the mechanism right here; rendering is the slow, expensive step. Label synthetic data and toy parameters on screen.

## Narration

Skip this section for captions-only video. With a supplied recording, inspect the audio and align its cues directly; skip voice selection, synthesis, and provider setup.

- Reuse the selected engine and voice. Otherwise choose a suitable available voice within existing authorization; offer alternatives only when the user requests them or the sample exposes a material problem. A quality sample does not require a user selection round.
- For a cloud engine, check authentication without revealing credentials and inspect current provider documentation or response metadata for supported controls, audio encoding, and sample rate. Keep credentials in a request header, read from `$ENV_VARS` or a protected file; reject an empty or malformed value without printing or silently rewriting it.
- Inspect the sample's pronunciation, pace, and beginning and end before batch synthesis. If a click, burst, or truncation is detected, inspect its waveform or short-window envelope to locate the defect. Trim or fade only confirmed artifacts, preserve speech onset and decay, and recheck the result; do not apply fixed cuts from another voice or model.

## Render

For the HTML path, make one file render any moment with `renderAt(t)`: deterministic, with no CSS animations or timers. Bind visual changes to cue identifiers and offsets. Build the timeline from measured narration durations or the caption-only storyboard, so editing a cue re-times the visuals. Add a `?scene=N` end-state preview and screenshot every scene before the full render.

Drive one headless Chrome session instead of launching Chrome once per frame. Use an available browser library or the DevTools protocol. For direct protocol access, the following is a sketch, not a complete runnable script: implement `send` with request IDs and error handling, wait for the connection and scene assets/fonts to be ready, and define `FPS` and the frame loop.

```js
// "$CHROME" --headless=new --hide-scrollbars --remote-debugging-port=9333 --user-data-dir=<PROFILE_DIR> about:blank
const page = (await (await fetch('http://127.0.0.1:9333/json/list')).json()).find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);  // send({id, method, params}), resolve on the matching id
await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'file://<SCENE_DIR>/scene.html' });
// per frame k:
const sig = (await send('Runtime.evaluate', { expression: `renderAt(${k / FPS})`, returnByValue: true })).result.value;
const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 } });
```

For long static holds, `renderAt` can return a signature covering all rendered state. Reuse the previous PNG only when that signature is unchanged and all assets are loaded.

With narration, place cue clips on the timeline (for example with `adelay` and `amix=normalize=0`), then level the mix; `loudnorm=I=-16:TP=-1.5` is a useful starting point for speech. Cache clips by engine/model, voice, text, and synthesis settings, and allow rendering a single scene for trials. Pad the audio or final visual hold to the planned end so neither cuts off the other.

Example assembly with narration:

```bash
ffmpeg -y -framerate 25 -i frames/%05d.png -i narration.m4a \
  -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a copy -movflags +faststart out.mp4
```

`yuv420p` keeps the file playable in QuickTime and browsers.

For captions only, omit audio inputs and filters:

```bash
ffmpeg -y -framerate 25 -i frames/%05d.png \
  -c:v libx264 -crf 20 -pix_fmt yuv420p -an -movflags +faststart out.mp4
```

## Verify

Check the encoded file, not the plan. For every video:

```bash
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of compact out.mp4
ffmpeg -y -ss <SECONDS> -i out.mp4 -frames:v 1 -vf scale=960:540 s<N>.png
ffmpeg -y -i s1.png -i s2.png -i s3.png -i s4.png -filter_complex "xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0" sheet.png
```

- Frames: the end state of every scene in a contact sheet, plus mid-motion frames where something moves. Captions fit, nothing overlaps, and product labels match the real UI.
- Playback and duration: decode/play through the result using available tools, confirm the requested duration, and check the opening and final hold. For captions only, confirm there is no audio stream and skip the checks below.

With narration:

```bash
ffmpeg -i out.mp4 -af volumedetect -vn -f null -
```

- Content: with an available, authorized transcription or audio-understanding tool, compare the spoken content with the script, normalizing punctuation and number formatting. Check flagged differences before re-synthesizing: transcription errors alone are not evidence of bad audio. Correct confirmed speech errors, limit retries to three per affected clip, and report unresolved differences. If no such tool is available, state that speech content was not verified; do not require a new cloud service just for this check.
- Audio and synchronization: inspect the encoded audio for clipping, abrupt cuts, clicks, or unexpected bursts, especially at cue boundaries. Use level measurements alongside available listening/audio-analysis tools; a peak below a threshold alone does not prove clean speech. Check that each spoken cue aligns with its visual change and that the ending is complete. Report any listening or synchronization checks that were unavailable.

Report only checks actually performed.

## Deliver

Save `<SUBJECT>.mp4` under `~/artifacts/` unless the user specified another path, with the storyboard beside it and each scene's start time so a reader can skim without playing. Keep the scene file, storyboard data, and render script there too. Link the video and briefly state its duration, narration engine/voice if used, checks performed, and material limitations. Keep routine speech edits in the script rather than listing them in the handoff. If rendering failed, say what is missing and label the storyboard and HTML stepper as substitutes.
