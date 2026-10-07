# Choose the video workflow

Read only after video is the selected explanation form. Infer the choice from the brief and inspected material; do not turn tool selection into a questionnaire. Honor an explicit tool choice and reuse a suitable existing project. These are workflow defaults, not exclusive capabilities or performance rankings.

## Choose from what must be visible

The visual requirements choose the scene engine. Precision and reuse can justify a composition tool; audio changes the workflow without automatically changing the scene engine.

| Required visuals | Starting point | Boundary |
| --- | --- | --- |
| Equations, geometry, graphs, or algorithm states whose transformations carry the explanation | Manim | Use its explicit objects and transformations when they simplify the core scene; a technical topic alone does not require Manim. |
| Text, layouts, UI motion, narrated slides, or repeated versions driven by data | Remotion | Compose the timeline with React and frame-based timing. Import a specialist scene when that is simpler than rebuilding it. |
| A small self-contained diagram animation, especially one reusing an HTML explainer | Bundled HTML renderer | Keep the lightweight path when inline SVG/DOM and a deterministic timeline are sufficient; use [video-renderer.md](video-renderer.md). |
| Cinematic or realistic illustrative footage that contributes to the explanation | An available, authorized generative video tool | Generate shots, then inspect and assemble them. Author exact labels, UI, numbers, and causal state changes in code. |

Prefer one tool when it meets the brief. Add Remotion around Manim scenes when a longer narrative or reusable template needs it; narration alone is not a reason to add a second tool. Generated footage can be an insert in an authored composition. Assign each tool a specific job before accepting the extra rendering and synchronization work.

Keep required facts and state transitions inspectable. Generated footage illustrates the explanation; it is not evidence of actual system behavior. A cinematic style request does not justify generating a diagram whose correctness depends on exact relationships.

For a quick draft, lower resolution or preview one hard scene. Do not replace required precision with generative footage merely because it might be faster. Total effort includes setup, rendering, revisions, and generation retries; avoid fixed speed scores.

## Check only the chosen path

- **Manim:** check the active Python environment and `manim --version`; check TeX only when the scene uses TeX-based objects. Preview a representative scene at low quality. If using Manim Voiceover, verify that plugin and the chosen speech service separately; it is optional, and recorded or synthesized audio can also be aligned during assembly.
- **Remotion:** inspect the existing project's package scripts, lockfile, installed version, and render setup. Use its package manager and drive motion from composition frames so seeking and rendering agree. When a relevant Remotion skill is available, load only the guidance needed for the requested stage; otherwise use current official docs. A Studio or Player preview does not establish that an export succeeded.
- **HTML:** check Node, Chrome/Chromium, `ffmpeg`, and `ffprobe` against the [bundled renderer contract](video-renderer.md). Its `renderAt(t)` API applies to this path only.
- **Generative footage:** verify an actual video-generation tool or service is available, authentication is configured without exposing credentials, and the selected model supports the requested references, duration, aspect ratio, and audio. Image generation alone does not provide a video renderer. Check current provider docs and stay within authorized processing and cost; bound attempts by the task budget and stop when further takes cannot resolve the required precision.

For encoded delivery, check `ffmpeg` and `ffprobe` for the common verification steps. An unavailable preferred tool can be replaced by another feasible path only if it preserves the user's explicit constraints and the explanation. If no suitable path is available, identify the missing prerequisite and label any storyboard or HTML stepper as a substitute.

## Fit audio to the visual workflow

Keep captions-only as the default when no audio was requested. With a supplied recording, use its measured timing. With requested narration, reuse the selected authorized TTS service and voice; a tool's example provider or built-in audio feature does not change that choice.

- Manim Voiceover can align animation to speech; use it when that helps the scene.
- Remotion can arrange imported audio and captions on its timeline. Synthesize TTS separately through the chosen service; a React composition is not itself a speech engine.
- The bundled HTML renderer takes one mixed audio file starting at timeline zero.
- For requested in-scene dialogue or sound, verify the generative model's audio support and inspect every selected take. When exact scripted speech matters, prefer a separately controlled recording or TTS track and authored captions, while honoring an explicit native-dialogue request. Remove unwanted generated audio in a captions-only video.

## Combine scenes without losing timing

For mixed workflows, keep scene IDs, clip paths, durations, cue offsets, and final timeline positions together. Each cue should have one owner for narration and captions so an imported clip does not duplicate the composition's audio or text. Re-render changed source scenes and recheck downstream timing. Inspect the assembled sample with its real assets; clean individual clips do not validate the final composition.

Continue with the shared [storyboard, render, and verification workflow](explainer-video.md). Preserve selected generated clips and their provenance because repeating a prompt may not reproduce the same footage.

## Calibration

- A two-sentence definition or an interactive parameter experiment still follows the main skill's prose/HTML routing; this reference does not turn it into a video.
- "做个视频，逐步展示矩阵变换。" → Manim is a useful default for the transformation; no audio pipeline without an audio request.
- "把产品流程做成带旁白的视频，每周替换数据复用。" → Remotion composition and reusable inputs, with the selected narration service.
- "用现成 HTML 动画导出一个短 MP4。" → inspect compatibility and adapt it to the bundled renderer; preserve the existing asset when it suffices.
- "数学推导要精确，还要放进多个课程版本。" → Manim scenes plus a reusable Remotion composition if those roles justify two tools.
- "用电影感镜头引入原理，再准确显示数值变化。" → generated illustrative footage only if available and authorized; author the numerical mechanism and captions in code.

## Sources

Selection approach adapted from [Frame — Video Tool Chooser](https://video-tool-chooser.haowei520.chatgpt.site/), inspected 7 October 2026. The HTML path is retained from this skill. Read only the current official docs needed for the chosen implementation:

- [Manim quickstart](https://docs.manim.community/en/stable/tutorials/quickstart.html) and [Manim Voiceover](https://docs.manim.community/en/stable/guides/add_voiceovers.html).
- [Remotion fundamentals](https://www.remotion.dev/docs/the-fundamentals) and [audio composition](https://www.remotion.dev/docs/using-audio).
- Provider-specific examples: [Runway generation workflow](https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5) and [Veo](https://deepmind.google/models/veo/). Capabilities vary by model; these examples are not a provider preference or authorization.
