# ArcSite Skills

Skills for day-to-day engineering work and self-contained HTML handoffs at ArcSite. Each skill lives under `skills/<bucket>/<name>/` with a discoverable `SKILL.md`.

## Use

Install the skill folders in your agent's skills directory, or use `bash scripts/copy-skills.sh` to copy them into `~/.agents/skills`. The copy script merges files; it does not remove files retired from this repository.

Prerequisites depend on the workflow: authenticated `gh` for GitHub, configured `jira-cli` for Jira, and a Sentry connector or `SENTRY_AUTH_TOKEN` for Sentry. Skills check the relevant access before network operations.

## Engineering

- [jira-ticket-manager](skills/engineering/jira-ticket-manager/SKILL.md) — Create, search, view, and update tickets with ArcSite component and Backlog defaults.
- [last30days](skills/engineering/last30days/SKILL.md) — Synthesize recent community discussion with dated sources and explicit coverage limits.
- [pr-code-review](skills/engineering/pr-code-review/SKILL.md) — Review a PR for actionable defects; present findings locally and publish when authorized.
- [pr-fix-loop](skills/engineering/pr-fix-loop/SKILL.md) — Fix CI and review findings, push, and re-scan the current head. Reply and resolve when authorized.
- [sentry-issue-resolver](skills/engineering/sentry-issue-resolver/SKILL.md) — Diagnose from event evidence and source; implement fixes when requested.
- [signoff](skills/engineering/signoff/SKILL.md) — Commit task-owned changes, push, create/update the PR, and open it in the default browser.
- [stack-pr](skills/engineering/stack-pr/SKILL.md) — Plan and construct dependency-ordered PRs from committed changes, preserving the source branch.

## HTML artifacts

Use these for an HTML or visual document handoff. Ordinary reviews, explanations, summaries, and GitHub PR descriptions can stay in chat or Markdown.

- [html-module-map](skills/html-artifacts/html-module-map/SKILL.md) — Module/workflow diagrams, execution walkthrough, and key source locations.
- [html-pr-review](skills/html-artifacts/html-pr-review/SKILL.md) — Reviewer companion with risk mapping and annotated changes.
- [html-pr-writeup](skills/html-artifacts/html-pr-writeup/SKILL.md) — Author's explanation of behavior, motivation, risk, and validation.
- [html-thread-recap](skills/html-artifacts/html-thread-recap/SKILL.md) — Conversation handoff with decisions, reasoning, abandoned approaches, and remaining work.
- [html-artifact](skills/html-artifacts/html-artifact/SKILL.md) — Other self-contained visual reports, comparisons, and explainers.

The shared [base tokens](skills/html-artifacts/_shared/design-tokens.md) link to component references loaded as needed. Edit sources under `_shared/`, then synchronize the standalone skill copies:

```bash
bash scripts/sync-shared.sh
bash scripts/sync-shared.sh --check
```

## Authoring

See [AGENTS.md](AGENTS.md) for layout and sync conventions. Keep instructions focused on project defaults, non-obvious constraints, and useful decision criteria; avoid generic tutorials and repeated approval gates.
