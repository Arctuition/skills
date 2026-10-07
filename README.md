# ArcSite Skills

Skills for day-to-day engineering work at ArcSite. Each skill lives under `skills/<name>/` with a discoverable `SKILL.md`.

## Use

Install the skill folders in your agent's skills directory, or use `bash scripts/copy-skills.sh` to copy them into `~/.agents/skills`. The copy script merges files; it does not remove files retired from this repository.

Prerequisites depend on the workflow: authenticated `gh` for GitHub, configured `jira-cli` for Jira, and a Sentry connector or `SENTRY_AUTH_TOKEN` for Sentry. Skills check the relevant access before network operations.

## Skills

- [adaptive-explainer](skills/adaptive-explainer/SKILL.md) — Pick the clearest sufficient explanation form, from prose and tables to a self-contained HTML explainer or a short video, with tool selection matched to the visuals and reuse needs.
- [jira-ticket-manager](skills/jira-ticket-manager/SKILL.md) — Create, search, view, and update tickets with ArcSite component and Backlog defaults.
- [last30days](skills/last30days/SKILL.md) — Synthesize recent community discussion with dated sources and explicit coverage limits.
- [pr-code-review](skills/pr-code-review/SKILL.md) — Review PR correctness, excessive defenses and abstractions, abstraction leaks, project conventions, and test value; present findings locally and publish when authorized.
- [pr-fix-loop](skills/pr-fix-loop/SKILL.md) — Fix CI and review findings, push, and re-scan the current head. Reply and resolve when authorized.
- [sentry-issue-resolver](skills/sentry-issue-resolver/SKILL.md) — Diagnose from event evidence and source; implement fixes when requested.
- [signoff](skills/signoff/SKILL.md) — Commit task-owned changes, push, create/update the PR, and open it in the default browser.

## Authoring

See [AGENTS.md](AGENTS.md) for layout conventions. Keep instructions focused on project defaults, non-obvious constraints, and useful decision criteria; avoid generic tutorials and repeated approval gates.
