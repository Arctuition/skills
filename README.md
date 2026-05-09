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
- **[pr-code-review](./skills/engineering/pr-code-review/SKILL.md)** — Review GitHub PRs via `gh`. Posts inline comments on specific lines and submits a single batched review with a P0–P3 priority summary and a verdict.
- **[sentry-issue-resolver](./skills/engineering/sentry-issue-resolver/SKILL.md)** — Fetch a Sentry issue with full stack trace and event context, then walk the root cause and propose a fix.

### HTML Artifacts

Skills that produce a single self-contained HTML file you can hand to a teammate. They share a visual vocabulary in [`references/design-tokens.md`](./skills/html-artifacts/html-module-map/references/design-tokens.md).

- **[html-module-map](./skills/html-artifacts/html-module-map/SKILL.md)** — Break down a module, feature, or workflow into an inline-SVG architecture diagram with the hot path highlighted, a key-files panel, a numbered callstack walkthrough, gotchas, and a glossary.
- **[html-pr-review](./skills/html-artifacts/html-pr-review/SKILL.md)** — Code review companion for the reviewer: risk-coloured file map, annotated diff with margin notes and severity tags, call graph, and questions worth asking the author.
- **[html-pr-writeup](./skills/html-artifacts/html-pr-writeup/SKILL.md)** — PR cover letter for the author: motivation, before/after behaviour, file-by-file tour, where to focus the review, test plan, and rollout.
- **[html-thread-recap](./skills/html-artifacts/html-thread-recap/SKILL.md)** — Decision log of a Claude / ChatGPT / pairing thread for a teammate who wasn't in the room — questions explored, decisions and tradeoffs, dead ends, open questions, artifacts.

## Adding a Skill

See [CLAUDE.md](./CLAUDE.md) for the layout and conventions.
