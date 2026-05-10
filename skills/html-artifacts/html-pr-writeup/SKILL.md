---
name: html-pr-writeup
description: Produce a single-file HTML "PR writeup" artifact that explains a pull request to its reviewers — motivation, before/after behavior, file-by-file tour with the reasoning, where to focus the review, test plan, and rollout. Use this skill whenever the user is about to open a PR, has just finished a branch, mentions writing a PR description, asks for a PR write-up, says things like "explain this change to my team", "help me pitch this PR", "write the PR description", "summarize what I'm shipping", or wants to make sure reviewers understand intent and risk before they read the diff. Trigger even when they don't say "HTML" — the artifact format is the whole point and the user should not have to ask for it by name.
---

# PR writeup → HTML artifact

You are helping the user produce one self-contained HTML file that serves as the PR's cover letter to its reviewers. The artifact replaces a wall of markdown that nobody reads with a document people actually open.

The reader is a reviewer who has not touched this code recently. They want, in this order: what changed and why it matters, what's risky, what to focus on, and what to skip.

## Inputs you should gather

Before writing, make sure you know:

1. **The diff** — file paths, lines added/removed, the actual hunks. Get this from `git diff`, the user's paste, or by reading the modified files.
2. **The base and head branch** — usually `branch → main` or similar.
3. **The motivation** — why this change exists. Read recent commits, related issues, or just ask the user one short question.
4. **What's risky** — files the user is unsure about, hot paths, unusual patterns, anything that needed real thought.
5. **How to verify** — tests added, manual steps the reviewer can run, staging links if any.

If a piece is missing and you can find it from the repo (`git log`, the issue tracker via MCP, the PR template), find it. If it's still missing, ask the user one focused question rather than fabricating.

## Structure of the artifact

Use this structure unless the user explicitly asks for something different. Skip a section if it would be empty — never pad.

1. **Header** — eyebrow (`PULL REQUEST · <repo>`), `h1` with the PR title, meta line with file count, +/-, branch, author.
2. **Optional prompt box** — the user's original ask, if it's instructive.
3. **TL;DR** — three to five sentences the reviewer can read and feel oriented. Lead with the user-visible behavior change.
4. **Why** — the actual reason. Tie it to a real problem (incident, perf number, customer report, design doc). Not "to improve X" — be specific.
5. **Before / after** — two-column comparison of the observable behavior. Use the `.ba-grid` component. Keep entries concrete (timings, error rates, retry counts), not adjectives.
6. **File-by-file** — ordered for *reading*, not alphabetically. Start at the most important new thing and walk outward. For each file: the file path (mono), a one-line `risk-tag` (safe / worth a look / needs attention), what changed and why, and a short code snippet for non-trivial hunks.
7. **Where to focus** — a short numbered list. "Look hard at X. Skim Y. Skip Z, it's mechanical." Reviewers love this.
8. **Test plan** — what's covered by automated tests, what was verified manually, what wasn't tested and why that's OK.
9. **Rollout** — is there a flag? Migration order? Monitoring to watch? If none of that applies, say so in one line and move on.

A right-side TOC sidebar is helpful when the document gets above ~3 screens.

## Writing the prose

The prose is what makes the difference between a PR description nobody reads and one they do. A few habits:

- **Lead with the user.** "Notification sends were happening inline on the request path; under load they added 200–800ms of latency." Not "this PR refactors X."
- **Show the seam, not the whole change.** A reviewer doesn't want every line explained — they want to know what's structurally new and why it had to be new.
- **Quantify when possible.** "p99 dropped from 1.4s to 180ms in staging" beats "performance improved."
- **Name the trade-offs you accepted.** Reviewers are happier knowing you considered the alternative than discovering you didn't.
- **Risk tags should be honest.** If a file is genuinely safe (renaming, type-only, test-only), say so — the reviewer can move past it. If a file is "worth a look", say what specifically to look at.

## Visual style

Apply the tokens and components in `references/design-tokens.md` exactly. The visual language across these artifacts is intentionally consistent:

- Ivory background, slate text, serif `h1`/`h2`, mono for filenames/eyebrows/labels.
- Risk tags use clay (attention) / oat (worth a look) / olive (safe).
- Code blocks have a soft gray-150 background; line numbers are optional.
- No emoji, no gradients, no logo footer.

## Output

Write the result to a single `.html` file. Default filename: `pr-<number>-writeup.html` if a PR number is known, otherwise `pr-<branch-name>-writeup.html`. Save it in `~/artifacts/`, creating the directory if it doesn't exist. If the user specified a directory or filename, honor that instead. Surface a `computer://` link so the user can open it themselves — don't auto-open.

Tell the user where you saved it and offer to (a) upload it somewhere shareable, or (b) iterate on a specific section. Don't dump the HTML source into chat — the artifact is the deliverable.

## Output language

Match the user's language. If the user wrote the request in Chinese, the HTML body should be Chinese (filenames, code, and color tokens stay as-is). If the user mixed languages, follow the dominant one in the request itself.

## When *not* to use this skill

- The user asked for a markdown PR description for a tool that only accepts markdown — produce markdown directly. (You can still offer the HTML artifact as a companion.)
- The change is one trivial commit (typo, dependency bump). The PR title and a sentence are enough; producing a full artifact would be overkill and ridiculous.

## Reference

- `references/design-tokens.md` — full CSS/component vocabulary (eyebrow, TL;DR, before/after grid, file cards with risk tags, code blocks, TOC sidebar). Read it before assembling the HTML — it has the full CSS and component markup you need to drop into the document's `<style>` and body.
