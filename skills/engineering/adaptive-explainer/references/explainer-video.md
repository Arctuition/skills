# Explainer video

Use when motion itself carries the information (continuous change, spatial transformation, a process the reader must watch unfold) or when the user asked for a video. For staged change, a stepper inside an HTML page is the default; a video is the escalation, not the starting point.

The model writes the program that renders the video; it does not emit video. Everything below depends on tools present on the machine.

## Check the toolchain first

```bash
command -v ffmpeg manim say
ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

- Frames: `manim` for math or algorithm animation when installed. Otherwise render each frame from an HTML/SVG/canvas scene with headless Chrome. Do not install anything without asking.
- Narration: macOS `say` is free and offline. Use another TTS only when the user supplies it. On-frame captions are a valid substitute; narration is optional.
- Assembly: `ffmpeg`. Without it there is no video; say so and deliver the storyboard plus the HTML stepper.

## Storyboard before rendering

Write a storyboard table first: scene number, what is on screen, the caption or narration line, and seconds. One idea per scene, 20 to 90 seconds total. Get the mechanism right here; rendering is the slow, expensive step. Label synthetic data and toy parameters on screen.

## Render

Make the scene deterministic: one HTML file that renders scene `N` from a query parameter, so every frame is reproducible.

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1280,720 \
  --screenshot="frames/0001.png" "file://<SCENE_DIR>/scene.html?step=1"

say -o narration.aiff -f narration.txt
ffmpeg -y -i narration.aiff -c:a aac narration.m4a

ffmpeg -y -framerate 1 -i frames/%04d.png -i narration.m4a \
  -c:v libx264 -pix_fmt yuv420p -shortest out.mp4
```

Drive scene durations from narration length; `-framerate 1` means one frame per second, so repeat or interpolate frames for longer scenes. `yuv420p` keeps the file playable in QuickTime and browsers.

## Verify

```bash
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of compact out.mp4
ffmpeg -y -ss <SECONDS> -i out.mp4 -frames:v 1 check.png
```

Inspect a frame per scene for legible text and correct content, and confirm duration and audio presence. Report only checks actually performed.

## Deliver

Save `<SUBJECT>.mp4` under `~/artifacts/` with the storyboard beside it so a reader can skim without playing. A storyboard is not a video. If rendering failed or a tool is missing, say exactly what is missing and deliver the storyboard plus the HTML stepper as the substitute.
