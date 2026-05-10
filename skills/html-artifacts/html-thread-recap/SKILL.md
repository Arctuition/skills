---
name: html-thread-recap
description: Produce a single-file HTML "thread recap" artifact that captures what was discussed in an agent / pairing / chat conversation — the questions explored, the decisions made and their tradeoffs, the dead ends we walked into, the open questions left, and the artifacts produced — so a teammate who wasn't in the room can pick up the context. Use this skill whenever the user asks to summarize a conversation/thread/session, mentions sharing a thread with colleagues, says things like "把这个对话总结一下", "share this thread with the team", "write up what we decided", "decision log for this conversation", "document the tradeoffs we made", "recap of our pairing session", or wants to hand off a Claude/ChatGPT/agent transcript as context. Trigger even when "HTML" isn't said — the artifact format is the whole point. Input can be the current session's own conversation context OR a transcript the user pastes in.
---

# Thread recap → HTML artifact

You are helping the user produce one self-contained HTML file that captures the substance of a conversation — usually a Claude Code / Claude.ai / pair-programming thread — for a colleague who wasn't in it. The reader is a peer who needs *context*, not a play-by-play. They want to know what was being worked on, what got decided and why, what didn't work, and what's still in the air.

The artifact is a **decision log first**, transcript second. A good recap can be skim-read in two minutes and absorbed in ten. A literal turn-by-turn dump is what you're replacing, not what you're producing.

## Inputs and how to read them

The conversation source is one of:

1. **The current Claude Code / agent session.** The user is in an active session and asks "summarize what we did" or "share this thread with X". You already have the conversation in your context — work from it directly.
2. **A pasted transcript or log file.** The user supplies a block of text (Claude.ai export, a copy/paste from another tool, a `.jsonl` log). Read it in full before drafting.

Either way, before writing, identify these from the source:

1. **The topic.** One short phrase — what was the conversation about? "Refactoring the order pipeline", "Investigating slow checkout", "Designing the auth migration". Pin this first; it sets the artifact's title.
2. **The questions explored.** The distinct sub-problems that came up. Multiple topics often weave together — separate them so each can be answered cleanly in its own card.
3. **The decisions made.** Anywhere two or more options were considered and one was picked — even if the conversation didn't frame it as a "decision" at the time. These are the heart of the artifact. For each, capture: the question, the options, what was chosen, **and why** (the constraint, the data, the priority that tipped it).
4. **The dead ends.** Things tried that didn't work, hypotheses that turned out wrong, refactors that got abandoned partway. These are *high-value content* for the reader — they save the next person from repeating the same mistake. Don't hide them out of embarrassment.
5. **Open questions.** Things that came up but weren't resolved, follow-ups the user said they'd do later, ambiguities you both noticed. Honest > pretending it's all solved.
6. **Artifacts produced.** Files created or modified, commands run that produced lasting effects (migrations, deploys), external resources written or referenced (Jira tickets, Sentry issues, design docs).
7. **External references.** Jira tickets, Sentry issues, documentation URLs the conversation cited. Surface them with source labels so the reader can chase them down.

If the conversation is huge (hundreds of turns), don't try to capture everything. Pick the consequential moments. A 10-decision recap of a sprawling thread is more useful than a literal index.

If a piece is missing — e.g. a decision was made but the *why* wasn't articulated in the conversation — ask the user one focused question rather than fabricating a rationale. "You picked the queue-based approach over inline retries — what was the deciding factor? I'll drop it into the recap."

## Structure of the artifact

Use this default structure. Skip a section when it would be empty (don't pad with "no dead ends!"). The order is calibrated for a colleague who'll skim — most-useful content first.

1. **Header** — eyebrow (`THREAD RECAP · <topic-or-repo>`), `h1` naming the topic, meta line with date / turn count / source (e.g. `Claude Code session · 2026-05-09 · 47 turns`).
2. **TL;DR** — 3–5 sentences. Lead with what was being figured out, then the headline decision, then the current state. A reader who reads only this should know whether to keep going.
3. **Topics explored** *(optional, only if there were ≥2 distinct topics)* — chip overview that jumps to each section. Skip when the recap is single-topic.
4. **Decisions & tradeoffs** — the heart of the document. One **decision card** per consequential decision (see below). Order them by importance, not chronology. A thread with one big decision and three small ones puts the big one first.
5. **Dead ends** — list of attempts that didn't work. Each entry: what we tried, why we abandoned it, in 1–2 sentences. Mark clearly so the reader knows "don't go down this path again".
6. **Open questions** — what's still unresolved. Each entry: the question and (if known) who's expected to resolve it / what blocks the answer.
7. **Artifacts & references** — two-column or stacked: *Files touched* (mono filenames + one-line description of what changed) and *External links* (Jira / Sentry / docs URLs, each with a source-label badge).
8. **Optional: select excerpts** — if 1–3 specific turns are worth quoting verbatim (a user constraint that drove the design, a particularly clear explanation), pull them as quoted blocks. Don't paste the whole transcript.

A right-side TOC sidebar is helpful when the document gets above ~3 screens.

## The decision card — the most important component

Every decision card answers four things, in this order:

```
┌─ DECISION 1 ────────────────────────────────────────────────┐
│ Question: <the thing being decided>                         │
│                                                             │
│ Options considered:                                         │
│   ✓ Option A — <one line>            (chosen)               │
│   ✗ Option B — <one line>            (rejected)             │
│   ✗ Option C — <one line>            (rejected)             │
│                                                             │
│ Chose A because: <the deciding constraint or priority>      │
│                                                             │
│ Tradeoff accepted: <what we gave up by picking A>           │
└─────────────────────────────────────────────────────────────┘
```

Use the markup in `references/design-tokens.md` under "Decision card". Two real rules:

1. **Name the tradeoff explicitly.** A decision without a tradeoff isn't a decision — it's a discovery. Say what was given up: "Chose the queue approach; gave up real-time delivery confirmation in exchange for resilience." Reviewers and future-you both need this.
2. **The "because" is the deciding factor, not a list of pros.** "Chose A because we needed sub-100ms p99 latency" beats "Chose A because it's faster and simpler and more maintainable". One sharp reason.

If the conversation produced a decision without considering alternatives ("we just did it the obvious way"), it's probably not worth a card. Drop it. Cards are for moments where someone could reasonably have done it differently.

## Handling the four content types

The conversation will mix four kinds of content. Each has its own treatment:

- **Code snippets / diffs** — use the mono `.code` block (and `.add` / `.del` line styling for diffs). Don't paste the whole file — paste the seam that shows what changed. If a decision was about a specific code shape, include 5–15 lines so the reader sees what was picked.
- **Command output / errors** — wrap in `.code` with a small mono caption ("`pytest output`", "`Sentry stack trace`"). Truncate long traces; the relevant frame and the error message are enough.
- **Dead ends / pivots** — flag with the `.dead-end` callout (oat background, struck-through-feel). The conversation phrasing "we tried X but..." should map cleanly to this component. Include the *why it failed* — that's what makes it useful.
- **External links** — Jira, Sentry, GitHub URLs, documentation. Use the `.ref-badge` component: source label (mono, uppercase) + the URL or ticket key. The reader should be able to identify the source at a glance: `JIRA · BLDR-1247`, `SENTRY · python-prod #91382`.

## Writing voice

- **Colleague-to-colleague**, not formal report. "We" is fine. "It turned out that…" is fine. This is a recap, not a press release.
- **Honest about messiness.** Dead ends and open questions are the parts your colleague *most* needs. Don't sand them off.
- **Paraphrase by default; quote when the wording matters.** "The user clarified that the 30-minute SLA is hard, not aspirational" is better than reproducing the exact turn — unless the exact wording is what changed the design.
- **Past tense.** The conversation already happened. "We considered X and picked Y" reads naturally; "We will consider X" is wrong.

## Visual style

Apply the tokens and components in `references/design-tokens.md` exactly. The visual language matches the other html-artifacts skills (`html-pr-writeup`, `html-pr-review`, `html-module-map`) so a team produces a coherent set of artifacts.

The decision card, dead-end callout, and reference badge are introduced in this skill — see the design-tokens file for their markup. Everything else (eyebrow, prompt box, code blocks, panels, chips) is reused verbatim from the shared vocabulary.

## Output

Default filename: `<topic>-recap.html` (e.g. `auth-migration-recap.html`, `slow-checkout-investigation-recap.html`). If the topic isn't obvious, ask one short question rather than guess.

<!-- shared:save-conventions-start -->
Save in `~/artifacts/`, creating the directory if it doesn't exist. If the user specified a directory or filename, honor that instead. Surface a `computer://` link so the user can open it themselves — don't auto-open. Don't dump the HTML source into chat — the artifact is the deliverable.
<!-- shared:save-conventions-end -->

After saving, offer to (a) iterate on a specific decision card, (b) add or remove a section, (c) tighten the TL;DR. Don't auto-share — the user decides where it goes.

## Output language

Match the user's prose language. Code, file paths, command output, error messages, ticket keys, and URLs stay verbatim — they're identifiers, not prose. If the user mixed languages in the original conversation, follow the dominant one in the request itself, not the conversation.

## When *not* to use this skill

- The user wants a PR description for a change — use `html-pr-writeup`.
- The user wants to review a PR — use `html-pr-review`.
- The user wants an architecture explainer for a module/workflow — use `html-module-map`.
- The conversation is one trivial Q&A ("how do I X?" → "do Y") — a recap would be longer than the conversation. Just answer in chat.
- The user wants a literal transcript export with no synthesis — that's a transcript tool, not this skill. This skill always editorializes.

## Reference

- `references/design-tokens.md` — full CSS/component vocabulary, including the decision card, dead-end callout, and reference badge introduced for this skill, plus everything reused from the shared design system. Read it before assembling the HTML — it has the full CSS and component markup you need to drop into the document's `<style>` and body.
