---
name: html-pr-review
description: Produce a single-file HTML "code review companion" artifact that helps a reviewer get oriented in someone else's pull request — a risk-coloured map of every file, an annotated diff with margin notes and severity tags, the call-graph that shows how the changed pieces fit together, and the questions worth asking the author. Use this skill whenever the user is about to review a PR, has been assigned one, mentions reviewing code they didn't write, says things like "help me review this", "I need to review PR #N", "what should I look at first", "I'm getting up to speed on this change", "I don't know this codebase well", or asks for a review checklist. Trigger even when the user doesn't say "HTML" — the artifact format is the whole point and the user should not have to ask for it by name. This skill is for the reviewer; if the user is the author writing their own PR description, use html-pr-writeup instead.
---

# PR review companion → HTML artifact

You are helping a reviewer who has been handed someone else's PR. They likely don't have full context. They want to know, in this order: where the risk is concentrated, what to read first, what to skip, and what to ask the author.

The artifact is *for the reviewer*, not the author. It's the document the reviewer wishes the author had written.

## Inputs you should gather

1. **The diff** — get the actual hunks via `git diff <base>..<head>`, the GitHub URL via MCP if available, or the user's paste. Don't summarize from filenames alone.
2. **The base branch / head branch / repo name.**
3. **Surrounding context** — the called-from / calls-into edges of the changed code. For a function that's been modified, find its callers (`grep`/`rg`). This is what makes the review *good*.
4. **What the author claimed** — read the PR description if it exists. Cross-check it against the diff.
5. **Tests** — what's covered, what isn't.

If something is missing and findable from the repo, find it. If still missing, ask one focused question.

## Structure of the artifact

Use this shape unless asked otherwise. Drop sections that would be empty.

1. **Header** — eyebrow (`<repo> · Pull Request #N`), `h1` with the PR title, author + age + branch + diff stats.
2. **What this PR does** — your reading of the change in three to five bullets, *not the author's words*. Reviewers want the independent restatement.
3. **Risk map** — every changed file as a clickable chip, coloured by your assessment: `safe` / `worth a look` / `needs attention`. The chips link to the corresponding file section. Add a legend.
4. **Files** — each file as a card with: path, +/-, risk tag, your reading of what changed, the relevant diff hunks, and inline review notes. For risky files, render the actual diff with margin notes (see "Annotated diff" below). For safe files, one sentence is enough.
5. **Questions for the author** — the things the diff alone doesn't answer. Numbered, specific, citing file:line.
6. **Test coverage** — what tests exist for the changed code, what's gapped, whether the gaps matter.
7. **Optional: Call-graph / module map** — if the change touches an unfamiliar area, an inline SVG of the affected modules helps a lot. See `references/design-tokens.md` for the box-and-arrow pattern.

## How to assign risk

Be honest, not flattering. The reviewer trusts the map only if it's calibrated.

- **safe** — type-only, rename, test, docs, dependency bump where the changelog is clean, mechanical refactor, additive code with no feature flag exposure.
- **worth a look** — new behaviour in a familiar pattern, refactors that change call-sites, additions to a critical-but-stable file.
- **needs attention** — new code on a hot path, concurrency / state changes, retry / idempotency, schema migrations, anything that touches auth / billing / pii, anything with a `// TODO` or `// FIXME` that the author left behind.

When you flag `needs attention`, the file's review note must say *what specifically* to look at. "This is risky" without a pointer is useless.

## Annotated diff format

For files with `worth a look` or `needs attention`, render the relevant hunks inline rather than just describing them. Use this pattern:

```html
<div class="diff">
  <div class="diff-row context"><span class="ln">42</span><span class="mark"> </span><pre>function pickWorker() {</pre></div>
  <div class="diff-row del">    <span class="ln">43</span><span class="mark">-</span><pre>  return workers[Math.floor(Math.random() * workers.length)];</pre></div>
  <div class="diff-row add">    <span class="ln">44</span><span class="mark">+</span><pre>  return workers[counter++ % workers.length];</pre></div>
  <div class="bubble blocking">
    <span class="label">BLOCKING</span>
    <p><code>counter</code> is module-local but workers run in multiple processes — round-robin per-process is not round-robin overall.</p>
  </div>
</div>
```

Bubble severities (use the colour rule from design-tokens):
- `blocking` (clay) — must change before merge
- `question` (slate) — needs an answer, may not need a change
- `nit` (gray) — preference, not a blocker

## Questions section

This is the most valuable part of the artifact. Aim for three to seven questions, each citing `path:line`, each genuinely answerable. Examples that work:

- "`workerPool.ts:42` — the round-robin uses a module-local counter; intended? With multiple Node processes this is approximate."
- "`migration_004.sql:11` — backfill is a single `UPDATE`; on a 50M-row table this needs a chunked job. Is that follow-up work or did I miss it?"

Questions that don't work: "is this tested?" (you can read the test file), "did you consider X?" (vague). Cite a line.

## Visual style

Use the tokens and components in `references/design-tokens.md`. Risk colours are non-negotiable: olive = safe, oat = worth a look, clay = needs attention. The reviewer learns the legend once and it must mean the same thing across every artifact you produce.

## Output

Save as `pr-<number>-review.html` in the user's outputs directory and surface a `computer://` link. After saving, ask whether they want you to (a) draft the GitHub review comments based on this, (b) deepen any section, or (c) move on. Don't dump the HTML source into chat.

## Output language

Match the user's language for prose. Filenames, code, branch names, bubble labels (`BLOCKING` / `QUESTION` / `NIT`), and risk tags can stay in English even if the prose is Chinese — they read as terms of art.

## When *not* to use this skill

- The user is the *author* writing their own PR description — use `html-pr-writeup` instead.
- The user just wants a one-line approve/reject — answer in chat, no artifact.
- The PR is a one-liner (typo, version bump). Eyeball it, comment in chat.

## Reference

- `references/design-tokens.md` — full CSS/component vocabulary (risk chips, bubbles, diff rows, SVG flow diagrams). Read it before assembling the HTML — it has the full CSS and component markup you need to drop into the document's `<style>` and body.
