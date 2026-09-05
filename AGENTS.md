# Skill authoring

Skills are organized into bucket folders under `skills/`:

- `engineering/` — operates on code and tickets.
- `html-artifacts/` — produces a single self-contained HTML file for handoff.

Add a new bucket only when at least two skills genuinely share it.

## Layout and discovery

```text
skills/<bucket>/<skill-name>/
├── SKILL.md
└── references/        # optional, linked from the workflow
```

Use a kebab-case folder name matching the frontmatter:

```yaml
---
name: skill-name
description: One or two sentences describing the capability and actual trigger phrases.
---
```

Keep descriptions specific enough to select the right skill. Do not turn ordinary reviews, summaries, or explanations into a different deliverable through overly broad triggers.

## Instructions worth keeping

Assume the model can perform ordinary coding, writing, and tool use. Keep project defaults, non-obvious workflow constraints, evidence requirements, and concise command examples that prevent a concrete mistake.

Delete duplicate tutorials and output scaffolding. Move substantial conditional details into linked references and explain when to read them. Preserve user intent and existing authorization; ask only for missing information or authority that materially affects the task.

The user's instructions take precedence over skill guidelines. Treat actionable requests such as "can you" or "help me" as instructions to execute within the requested scope; do not add confirmation gates or broaden a skill's discovery triggers to express this behavior.

## Conventions

- Every skill must have a top-level [README.md](README.md) entry linked to its `SKILL.md`.
- Use `<ANGLE_BRACKETS>` for user-supplied values and `$ENV_VARS` for environment variables in command templates.
- Check prerequisites and authentication before networked or destructive operations without exposing credentials.
- Prefer explicit, copy-pasteable commands over clever one-liners.
- Keep each installed skill self-contained; repository-relative links to sibling skills are not a runtime dependency.

## Shared HTML content

Maintain the common visual vocabulary and delivery rules in `skills/html-artifacts/_shared/`, even when a component currently serves only one skill.

```text
_shared/
├── design-tokens.md       # base style and component routing
├── components/*.md        # component groups read on demand
├── html-workflow.md       # shared build/verification block
└── save-conventions.md    # shared delivery block
```

`scripts/sync-shared.sh` propagates sources in two modes:

1. **File-level:** `_shared/design-tokens.md` and `_shared/components/*.md` copy into each HTML skill's `references/`, preserving the `components/` subdirectory.
2. **Block-level:** other `_shared/*.md` files replace regions between `<!-- shared:<name>-start -->` and `<!-- shared:<name>-end -->` in opted-in `SKILL.md` files. Skills without markers are untouched; unmatched markers are errors.

Edit shared sources, run `bash scripts/sync-shared.sh`, and include both sources and generated copies in the change. Do not edit generated references or shared blocks directly. Run `bash scripts/sync-shared.sh --check` before handoff; it fails on drift.

No starter `template.html`: the skill describes the document's purpose and useful structure, while base tokens and selected component references supply the CSS/markup vocabulary.
