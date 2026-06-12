# ArcSite Skills

Custom skills for [Claude Code](https://github.com/anthropics/claude-code) used day-to-day at ArcSite.

These skills are designed to be small and composable. Each one lives in its own folder under `skills/`, with a `SKILL.md` that defines when it triggers and how it runs.

## Quickstart

1. Clone this repo into your Claude Code skills directory (or symlink it).
2. Make sure the prerequisites for the skills you want are set up:
   - **sentry-issue-resolver** — `SENTRY_AUTH_TOKEN` env var
   - **jira-ticket-manager** — [`jira-cli`](https://github.com/ankitpokhrel/jira-cli) installed and `jira init` run
   - **pr-code-review** — [`gh`](https://cli.github.com/) installed and authenticated
3. Reference a skill by name in conversation, or invoke it directly with `/skill-name`.

## Reference

### Engineering

Skills that operate on code and tickets.

- **[jira-ticket-manager](./skills/engineering/jira-ticket-manager/SKILL.md)** — Create, search, view, and edit Jira tickets non-interactively via `jira-cli`. Auto-selects the right component (API / Projects / Proposals / Backends / Regression / AI).
- **[pr-code-review](./skills/engineering/pr-code-review/SKILL.md)** — Review GitHub PRs via `gh`. Posts inline comments on specific lines and submits a single batched review with a P0–P3 priority summary and a verdict. Supports an **interactive mode** ("interactive review", "手动挡", "discuss before posting") that drafts everything locally and waits for explicit approval before posting — and keeps the session open afterwards to collaborate on follow-up comments as the human reviewer surfaces more issues.
- **[pr-fix-loop](./skills/engineering/pr-fix-loop/SKILL.md)** — The author-side counterpart to `pr-code-review`. Loops over a PR until nothing actionable remains: scans CI failures, bot findings, and human inline comments; triages each into auto-fix / needs-confirm / skip; fixes the clear ones; quick-checks locally; commits, replies `addressed in <sha>`, pushes, and waits on CI with `gh pr checks --watch` before re-scanning. Confirms the plan on the first round then runs autonomously, with stop guards for max rounds, no-progress, undiagnosable CI, and any new design-call finding. Runs on any PR branch you have push access to, including PRs that already look ready to merge.
- **[sentry-issue-resolver](./skills/engineering/sentry-issue-resolver/SKILL.md)** — Fetch a Sentry issue with full stack trace and event context, then walk the root cause and propose a fix.
- **[signoff](./skills/engineering/signoff/SKILL.md)** — Wrap up the change in your working tree and open a PR: branch off main/master, commit only the files you touched (never others' staged/untracked work), push, open the PR following `.github/PULL_REQUEST_TEMPLATE.md`, and open it in the browser. Targets the `upstream` remote's default branch when one exists.

### HTML Artifacts

Skills that produce a single self-contained HTML file you can hand to a teammate. They share a visual vocabulary in [`_shared/design-tokens.md`](./skills/html-artifacts/_shared/design-tokens.md), propagated into each skill via [`scripts/sync-shared.sh`](./scripts/sync-shared.sh).

Specialized skills (use these when they fit):

- **[html-module-map](./skills/html-artifacts/html-module-map/SKILL.md)** — Break down a module, feature, or workflow into an inline-SVG architecture diagram with the hot path highlighted, a key-files panel, a numbered callstack walkthrough, gotchas, and a glossary.
- **[html-pr-review](./skills/html-artifacts/html-pr-review/SKILL.md)** — Code review companion for the reviewer: risk-coloured file map, annotated diff with margin notes and severity tags, call graph, and questions worth asking the author.
- **[html-pr-writeup](./skills/html-artifacts/html-pr-writeup/SKILL.md)** — PR cover letter for the author: motivation, before/after behaviour, file-by-file tour, where to focus the review, test plan, and rollout.
- **[html-thread-recap](./skills/html-artifacts/html-thread-recap/SKILL.md)** — Decision log of a Claude / ChatGPT / pairing thread for a teammate who wasn't in the room — questions explored, decisions and tradeoffs, dead ends, open questions, artifacts.

Catch-all (used only when none of the specialized skills fit):

- **[html-artifact](./skills/html-artifacts/html-artifact/SKILL.md)** — General single-file HTML for the long tail: status reports, incident timelines, slide decks, concept explainers, design comparisons, dashboards, prototypes. Enforces the shared design tokens; content and structure are left to the user and the material.

## Adding a Skill

See [CLAUDE.md](./CLAUDE.md) for the layout and conventions.
