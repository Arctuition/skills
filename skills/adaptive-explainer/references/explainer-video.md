# Explainer video

Use when motion itself carries the information (continuous change, spatial transformation, a process the reader must watch unfold) or when the user asked for a video. For staged change, a stepper inside an HTML page is the default; a video is the escalation, not the starting point.

The model writes the program that renders the video; it does not emit video. Everything below depends on tools present on the machine.

## Check the toolchain first

Check only the selected path. For an HTML renderer on macOS:

```bash
command -v ffmpeg ffprobe node
ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

- Frames: use installed `manim` for math or algorithm animation, or one HTML scene file with headless Chrome. The bundled HTML renderer needs Node 22.4+ and no npm packages; see [the renderer contract and commands](video-renderer.md). For other platforms, locate the installed browser rather than assuming the macOS path.
- Video is captions only unless the user asks for narration. Narration uses an authorized cloud TTS or a supplied recording, never system TTS such as macOS `say`.
- Assembly and inspection: `ffmpeg` and `ffprobe`. If rendering cannot be completed, explain the missing prerequisite and deliver the storyboard plus an HTML stepper as substitutes.

Carry forward existing authorization for installations and cloud processing. Ask only when a necessary action exceeds that scope; do not ask again for an already selected service or voice. Authorization for TTS does not automatically authorize sending the audio to a separate transcription service.

## Budget and write the script for the ear

Set the target length before drawing anything. For synthesized narration, use a short representative sample from the selected voice to estimate the draft's duration; for a supplied recording, measure its duration directly. Reserve time for pauses and inspecting the visuals. Use measured clip durations for the final timeline; character or word counts are drafting estimates, not timing guarantees. For captions only, budget reading and visual inspection time without a speech pipeline.

- A cue pairs a spoken clause or caption with the visual change it explains. Reuse cue identifiers across variants where the meaning stays the same; adapt the cues when a different audience needs a different explanation.
- Keep narration, subtitles, and diagram labels distinct: narration explains the connection, subtitles faithfully represent speech, and labels identify objects, values, and states. Avoid duplicating full sentences in the diagram. A visual cue need not be a separate TTS clip; synthesize complete sentences or connected passages when that preserves natural phrasing, then align their internal cues.
- In a non-English video, keep key technical terms in English across narration, captions, and labels alike.
- Write speech so its meaning does not depend on visible punctuation or symbols. Check ambiguous terms, English terms, and product names in the sample. If the voice mangles an English term, choose a voice that handles mixed-language text or respell the term for speech only; do not translate it. Captions keep the exact spelling.
- Write in the audience's vocabulary. For users, take terms and button names from their docs and UI and speak to "you"; drop internal identifiers. A new audience is a rewrite, not a translation.
- Check every product label drawn on screen against the source or the running UI. An invented button name means a re-render. Label example data on screen.

## Storyboard before rendering

Write a storyboard table first: scene ID, initial state, triggering event, resulting state and takeaway, caption or narration per cue, and seconds. Each scene should resolve one part of the explanation. Fit the requested duration; when none is given, aim for a short explanation, usually 20 to 90 seconds. Narrow the content before exceeding a requested limit. Get the mechanism right here; rendering is the slow, expensive step.

For example, explain a duplicate charge by keeping the same account visible: balance 100 → the first request executes → balance 90; its response is lost → the client times out while the balance stays 90; a retry executes without deduplication → balance 80. Show the event that causes each debit and keep server state distinct from client knowledge. These are illustrative values, not a production trace.

- Keep persistent objects recognizable through consistent labels and stable spatial anchors; move or recolor them when it communicates an event or focus change. Leave a readable hold after the active cause and its result.
- Use continuous motion for continuous change or movement. Update discrete state at the actual modeled event; do not tween a balance or counter through invented intermediate states.
- Keep diagram labels and subtitles legible at the expected playback size, with separate space for each. Inspect the densest frame at that size.
- Label synthetic data and toy parameters on screen. Distinguish playback time from modeled time when waits are compressed or events slowed down; apparent animation speed must not imply measured latency or throughput.

## Narration

Skip this section for captions-only video. With a supplied recording, inspect the audio and align its cues directly; skip voice selection, synthesis, and provider setup.

- Reuse the selected engine and voice. Otherwise choose a suitable voice from the authorized cloud service; offer alternatives only when the user requests them or the sample exposes a material problem. A quality sample does not require a user selection round.
- For a cloud engine, check authentication without revealing credentials and inspect current provider documentation or response metadata for supported controls, audio encoding, and sample rate. Keep credentials in a request header, read from `$ENV_VARS` or a protected file; reject an empty or malformed value without printing or silently rewriting it.
- Inspect the sample's pronunciation, pace, and beginning and end before batch synthesis. If a click, burst, or truncation is detected, inspect its waveform or short-window envelope to locate the defect. Trim or fade only confirmed artifacts, preserve speech onset and decay, and recheck the result; do not apply fixed cuts from another voice or model.

## Render

For the HTML path, use [scripts/render-video.mjs](../scripts/render-video.mjs) with the [renderer contract and commands](video-renderer.md). Make one scene file render any moment with `renderAt(t)`: deterministic even when seeking backward, with no CSS animations or timers driving the timeline. Derive scene boundaries, captions, and visual changes from the same cue data, using measured narration durations or the caption-only storyboard. The renderer handles browser startup, readiness, frame capture, encoding, and basic file checks.

With narration, prepare one mixed audio file starting at timeline zero. Place clips by their cue offsets (for example with `adelay` and `amix=normalize=0`), then level the mix; `loudnorm=I=-16:TP=-1.5` is a useful starting point for speech. Cache clips by engine/model, voice, text, and synthesis settings. Extend the final visual hold when needed to preserve the end of speech. The renderer pads short audio with silence and rejects audio that overruns the full visual timeline.

Before the full render, encode a representative scene with its actual motion, captions, and audio if used. Use `--scene <SCENE_ID>` for the HTML renderer or the equivalent in the chosen toolchain. Choose a scene with the hardest state change or densest information, often 5–10 seconds. Inspect it at the expected playback size and use available playback/listening tools to check pacing, pronunciation, and synchronization. Fix the sample before rendering the full timeline; this is an agent check, not a new user approval gate. A one-scene video can use that same render as the final file after inspection. Still inspect every scene in the final file. A captions-only sample cannot validate a narrated video's rhythm; report unavailable listening checks.

## Verify

Check the encoded file, not the plan. For every video:

```bash
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of compact out.mp4
ffmpeg -y -ss <SECONDS> -i out.mp4 -frames:v 1 -vf scale=960:540 s<N>.png
ffmpeg -y -i s1.png -i s2.png -i s3.png -i s4.png -filter_complex "xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0" sheet.png
```

- Frames: the end state of every scene in a contact sheet, plus mid-motion frames where something moves. Captions fit, nothing overlaps, and product labels match the real UI.
- Explanation: compare key encoded frames before and after a triggering event with the storyboard and source evidence or independent calculation. The cause must be visible, state must change at the right event, and the result must stay readable. A successful encode does not validate the mechanism.
- Playback and duration: decode/play through the result using available tools, confirm the requested duration, and check the opening and final hold. For captions only, confirm there is no audio stream and skip the checks below.

With narration:

```bash
ffmpeg -i out.mp4 -af volumedetect -vn -f null -
```

- Content: with an available, authorized transcription or audio-understanding tool, compare the spoken content with the script, normalizing punctuation and number formatting. Check flagged differences before re-synthesizing: transcription errors alone are not evidence of bad audio. Correct confirmed speech errors, limit retries to three per affected clip, and report unresolved differences. If no such tool is available, state that speech content was not verified; do not require a new cloud service just for this check.
- Audio and synchronization: inspect the encoded audio for clipping, abrupt cuts, clicks, or unexpected bursts, especially at cue boundaries. Use level measurements alongside available listening/audio-analysis tools; a peak below a threshold alone does not prove clean speech. Check that each spoken cue aligns with its visual change and that the ending is complete. Report any listening or synchronization checks that were unavailable.

Report only checks actually performed.

## Deliver

Save `<SUBJECT>.mp4` under `~/artifacts/` unless the user specified another path, with the storyboard beside it and each scene's start time so a reader can skim without playing. Keep the scene file, cue data, any audio/assets, a copy of the render script, and the exact render command there so the video can be reproduced. Link the video and briefly state its duration, narration engine/voice if used, checks performed, and material limitations. Keep routine speech edits in the script rather than listing them in the handoff. If rendering failed, say what is missing and label the storyboard and HTML stepper as substitutes.
