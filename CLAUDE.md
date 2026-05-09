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

## Shared design system for html-artifacts

The `html-artifacts/` skills share a single visual vocabulary defined in `skills/html-artifacts/_shared/design-tokens.md`. This file is the **source of truth** — it lives once and is propagated into each skill's `references/design-tokens.md` by `scripts/sync-shared.sh`.

```
skills/html-artifacts/
├── _shared/design-tokens.md         # source of truth — edit here
├── html-module-map/
│   └── references/design-tokens.md  # auto-synced copy — do not edit
├── html-pr-review/...               # same
├── html-pr-writeup/...              # same
└── html-thread-recap/...            # same
```

**To change tokens or components:**

1. Edit `skills/html-artifacts/_shared/design-tokens.md`
2. Run `bash scripts/sync-shared.sh`
3. Commit both the source and the synced copies in the same change

**Why not edit the copies directly?** Each `references/design-tokens.md` carries a do-not-edit header. Direct edits are silently overwritten on the next sync. If you've added a component used by only one skill, it still belongs in `_shared/` — keeping the vocabulary unified means future skills can pick it up without rewriting the wheel.

**To verify everything is in sync** (e.g., before pushing): `bash scripts/sync-shared.sh --check`. Exits non-zero on drift.

**`assets/template.html` is not synced.** Each skill's template is hand-maintained because each skill assembles its own document type. If a token changes in `_shared/`, templates may temporarily show the old style — that's acceptable because templates are a starting scaffold; the LLM uses `references/design-tokens.md` as the canonical reference when generating final HTML.
