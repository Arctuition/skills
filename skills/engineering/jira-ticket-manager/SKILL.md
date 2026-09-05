---
name: jira-ticket-manager
description: Create, search, view, or update Jira tickets with jira-cli, including requests such as "show my open bugs", "create a story", or "更新这个 ticket". Uses ArcSite components and defaults new tickets to Backlog.
---

# Jira Ticket Manager

Use `jira-cli` for the requested operation. Before network calls, check `command -v jira` and authenticated access with `jira me`; use the configured project unless the user specifies another. Do not reconfigure authentication automatically.

## Ticket conventions

Lead with the problem, impact, and desired outcome. Include technical constraints, reproduction details, and implementation decisions when they help the assignee; do not invent metrics or prescribe an unrequested solution.

For new tickets:
- Choose Epic, Story, Bug, or A/B Test according to the request and the project's configured types.
- Select a component from the table below, unless the user supplied one.
- Move the created ticket to Backlog unless another status was requested. If the transition fails, report the created key and actual status; do not create a duplicate.

| Component | Scope |
|---|---|
| API | Public endpoints and external integrations |
| Projects | Project features and workflows |
| Proposals | Proposal features and workflows |
| Backends | Server services, databases, caching, backend performance |
| Regression | Defects and regressions |
| AI | AI features and automation |

Use the affected feature and known cause to resolve overlaps. Verify configured values if Jira rejects a component or type; do not silently substitute a different work type.

## Create

Write multiline descriptions to a temporary file with the available file-editing tool, then pass that file to the CLI. Quote user text as shell data.

```bash
jira issue create -t "<TYPE>" -s "<SUMMARY>" -C "<COMPONENT>" \
  --template "<DESCRIPTION_FILE>" --no-input --raw
```

Read the returned JSON's issue key, then transition and verify:

```bash
jira issue move "<ISSUE_KEY>" "Backlog"
jira issue view "<ISSUE_KEY>"
```

Optional create fields: `-P "<EPIC_KEY>"`, `-a "<ASSIGNEE>"`, `-y "<PRIORITY>"`, `-l "<LABEL>"`. Do not set unrelated fields by default.

## Find and view

Use `--plain` to avoid the interactive list. For "my open tickets", default to the current user and unfinished statuses:

```bash
jira issue list -q 'assignee = currentUser() AND statusCategory != Done' --plain
jira issue view "<ISSUE_KEY>"
```

Add filters such as `-t Bug`, `-C Backends`, `--updated -7d`, or use `-q "<JQL>"`. Lists are paginated; use `--paginate "<OFFSET>:<LIMIT>"` when more results are needed, and disclose if the answer covers only one page.

## Update

Read the existing ticket first. Preserve unrelated fields and useful description content; append, refine, or replace according to the requested change.

```bash
jira issue edit "<ISSUE_KEY>" -s "<SUMMARY>" --no-input
jira issue edit "<ISSUE_KEY>" --no-input < "<DESCRIPTION_FILE>"
jira issue move "<ISSUE_KEY>" "<STATUS>"
```

For field edits, `-l` appends labels while `-C` replaces components; inspect the current values before using replacement flags. Use `jira issue edit --help` for other fields and removal syntax.

Verify the resulting ticket and return its key, URL, and any incomplete operation. Creating or editing a ticket does not imply posting additional comments or opening the browser.
