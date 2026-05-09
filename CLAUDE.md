# CLAUDE.md

Skills are organized into bucket folders under `skills/`:

- `engineering/` — operates on code and tickets (review, debugging, project management)
- `html-artifacts/` — produces a single self-contained HTML file for hand-off

Add a new bucket only when at least two skills genuinely share it.

## Skill folder layout

```
skills/<bucket>/<skill-name>/
├── SKILL.md           # required — YAML frontmatter + workflow
├── references/        # optional — supporting docs the skill links into
└── assets/            # optional — templates, e.g. starter HTML for html-artifacts
```

`<skill-name>` is kebab-case and matches the `name` in the frontmatter.

## SKILL.md frontmatter

```yaml
---
name: skill-name
description: One or two sentences. Be specific about trigger phrases and use cases — this is what Claude reads to decide whether to invoke the skill.
---
```

The description is the trigger. Vague descriptions don't fire. List the verbs and phrases a user would actually say.

## Conventions

- Every skill in `engineering/` and `html-artifacts/` must have an entry in the top-level [README.md](./README.md), linked to its `SKILL.md`.
- Use `<ANGLE_BRACKETS>` for user-supplied values and `$ENV_VARS` for env vars in command templates.
- Check prerequisites (auth tokens, installed CLIs) before running anything destructive or networked.
- Prefer explicit, copy-pasteable commands over clever one-liners.
