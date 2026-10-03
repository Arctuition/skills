---
name: adaptive-explainer
description: Explain a mechanism, design, or tradeoff in the clearest sufficient form, from prose and comparison tables to diagrams, runnable examples, a self-contained HTML explainer, or a short rendered video. Use for "讲清楚原理", "帮我理解", "explain how X works", or "how should I show this", when the user wants understanding rather than a fix, a review, a translation, or a quick lookup.
---

# Adaptive Explainer

Deliver the explanation, not a menu of formats. Pick the least complex form that resolves the user's obstacle; optimize for inspection, not polish or volume. Read the relevant code, files, or sources before explaining a specific system, and never invent unseen contents.

## Identify the obstacle

From the request and conversation, settle what the user should be able to do afterward (explain, predict, compare, debug, decide) and what blocks them: a missing definition, a hidden relationship, execution order, competing tradeoffs, parameter sensitivity, or change over time. Match the user's language, but keep key technical terms in English in every form: "这个 retry 没带 idempotency key", not "这个重试没带幂等键". Translate the sentence around a term, not the term the reader will meet in code, logs, and docs; product labels still match the real UI. Take depth from the user's stated goal and demonstrated knowledge. Check a suspected false premise before building an explanation around it.

Do not ask which format to use; choosing it is the task. Ask only when a missing fact would change the explanation's correctness or scope and cannot be recovered from sources.

## Route from the obstacle, not the topic

| Dominant task | Default form | Escalate only when |
| --- | --- | --- |
| One fact, definition, or distinction | Short prose, plus one example if it resolves confusion | A relation or process stays hard to follow |
| Compare options on shared criteria | Compact table plus a conditional conclusion | Dependencies or variable inputs decide the tradeoff |
| See structure, flow, ordering, or state | One focused diagram or event trace plus the takeaway | A static snapshot cannot show the important change |
| Understand execution, reproduce a bug, test a claim | Minimal runnable example with actual output | Varying parameters interactively teaches more than fixed runs |
| Explore "what happens when X changes" | Two or three worked scenarios | Several meaningful inputs or repeated comparisons make static examples cumbersome |
| Watch continuous motion or spatial transformation | Annotated frames or a stepper in an HTML page | Motion itself carries the information, or the user asked for a video |

Before escalating past prose or a table, name the concrete benefit: the user needs to see or change ___, and a simpler form makes ___ hard to inspect. Choose one primary form; add a secondary form only for a distinct job, such as a one-line conclusion over a diagram. A format the user explicitly requested skips this test but still has to be feasible and accurately labeled.

## Light path

Prose and tables: answer in the user's language, lead with the answer, name the mechanism, and keep necessary technical terms and uncertainty. Write in short sentences that each state one thing, with an explicit actor and the condition visible; use one term per concept throughout, never synonyms for variety. Table columns are the user's actual criteria; do not add ratings or a universal winner the evidence does not support.

Diagram in chat: pick the representation from what must become visible (ordering wants a sequence or event trace, dependencies a block diagram, legal transitions a state diagram), not from the topic. Use a compact ASCII diagram or an event trace with explicit actors and timing, and keep the normal path and the failure path visibly distinct. A Mermaid block is source, not a rendered diagram; use it only when the host renders it or the user asked for source.

Runnable example: keep it minimal, run it in the session, and show actual versus expected output. For concurrency, use a controlled schedule rather than sleeps and say which outcomes are permitted; one run proves nothing. Code that was not executed is labeled as unverified, not presented as a demonstration.

## HTML explainer

Escalate to a page when the routing test calls for interaction, a staged walkthrough, or a diagram that chat cannot render, or when the user asked for HTML. Read [html-explainer.md](references/html-explainer.md) and build it there; a static page is sufficient when nothing needs to change. Use a stepper inside the page when staged change matters.

## Explainer video

Only when the stepper falls short or the user asked for a video. Read [explainer-video.md](references/explainer-video.md) for causal storyboarding, timing, optional narration, the reusable HTML renderer, and verification of the encoded file. Render and inspect a representative scene with its actual captions, motion, and audio if used before the full video. Preserve the user's format, voice, and service choices and existing authorization. A storyboard is never presented as a video.

## Check before delivery

- **Coverage:** the result answers the actual question at the requested depth and resolves the identified obstacle. For a mechanism, check that the explanation connects the cause to the outcome; choosing a suitable format is not enough.
- **Grounding:** consequential claims trace to inspected sources or explicit derivations. Separate observed behavior, inference, and assumption; label synthetic data and toy models inside the artifact. A simulation passing its own checks does not verify the real system.
- **Boundary case:** for a nontrivial mechanism or decision, check one failure or edge case and show it only when it changes understanding.
- **Economy:** remove elements that do not teach something distinct; do not repeat the full explanation across prose, diagram, and page.

Report only checks actually performed.

## Deliver

Give the answer or takeaway first, then the explanation and any artifact link, then only the limitations needed to interpret it. No routing commentary, options menu, or "I chose this format because". If a follow-up shows the user is still confused, find the missing concept and change the example, level, or representation; do not make the same explanation longer or jump to a page.

## Calibration anchors

- "TTL 是什么？两句话。" → two sentences; nothing else.
- "响应丢失后为什么重试会重复扣款？" → a sequence trace grounded in the stated scenario, with server state and client knowledge visibly different.
- "超时不就说明服务端没执行吗？" → correct that premise first: a request that never arrived and a completed operation whose response was lost can both look like a timeout to the client.
- After a retry explanation, "还是没懂，为什么会扣两次？" → expose the missing link with a concrete balance trace: without deduplication, the retry can execute a second charge. Connect that second execution to the changed balance; do not just lengthen the first explanation.
- "给我一个能跑的例子看闭包捕获。" → a minimal executed example with its output, not a project.
- "让我调整 TTL 和请求间隔，观察命中率。" → an HTML explainer with those two controls; state the cache policy and that results are simulated.
- "用 HTML 解释什么是 TTL。" → honor HTML with a small static page; no sliders without explanatory value.
- "做个一分钟的视频讲 TCP 慢启动。" → captions only, since narration was not requested: budget caption reading time, render without audio, and skip TTS and audio checks. Check the toolchain, storyboard the events that change the congestion window, and fit the requested duration. Inspect a representative encoded scene before the full render, then verify the mechanism and timing in the final video. If rendering is unavailable, label the storyboard and HTML stepper as substitutes.
- "做个带旁白的视频。" with no TTS service authorized yet → ask which cloud service to use or for a recording; never fall back to system TTS such as macOS `say`.
- "用刚才选好的声音和已授权的云服务做视频。" → reuse that voice and authorization; sample it for quality without requiring another voice-selection round.
