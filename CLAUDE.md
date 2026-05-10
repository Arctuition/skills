# CLAUDE.md

Skills are organized into bucket folders under `skills/`:

- `engineering/` — operates on code and tickets (review, debugging, project management)
- `html-artifacts/` — produces a single self-contained HTML file for hand-off

Add a new bucket only when at least two skills genuinely share it.

## Skill folder layout

```
skills/<bucket>/<skill-name>/
├── SKILL.md           # required — YAML frontmatter + workflow
└── references/        # optional — supporting docs the skill links into
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

## Shared content for html-artifacts

The `html-artifacts/` skills share content from `skills/html-artifacts/_shared/`. `scripts/sync-shared.sh` propagates that content into each skill in two modes:

```
skills/html-artifacts/
├── _shared/
│   ├── design-tokens.md             # file-level: synced as a whole into each references/
│   └── save-conventions.md          # block-level: spliced into each SKILL.md between markers
├── html-module-map/
│   ├── SKILL.md                     # contains <!-- shared:save-conventions-start/end --> markers
│   └── references/design-tokens.md  # auto-synced copy — do not edit
├── html-pr-review/...               # same
├── html-pr-writeup/...              # same
└── html-thread-recap/...            # same
```

**Two sync modes:**

1. **File-level (`_shared/design-tokens.md`)** → copied wholesale to each skill's `references/design-tokens.md`. Use for bulky reference material that the agent reads on demand.
2. **Block-level (every other `_shared/*.md`)** → spliced into any `SKILL.md` that opts in by wrapping a region with `<!-- shared:<name>-start --> ... <!-- shared:<name>-end -->` markers. Content between the markers is replaced on every sync. Use for short, load-bearing rules (e.g. output conventions) that must stay in `SKILL.md` itself so the agent sees them on every skill trigger.

**To change shared content:**

1. Edit the file in `skills/html-artifacts/_shared/`
2. Run `bash scripts/sync-shared.sh`
3. Commit both the source and the synced copies/blocks in the same change

**Why not edit the copies directly?** `references/design-tokens.md` carries a do-not-edit header; SKILL.md regions between `<!-- shared:* -->` markers are silently overwritten on the next sync. If a component or rule is currently used by only one skill, it still belongs in `_shared/` — keeping the vocabulary unified means future skills can pick it up without rewriting the wheel.

**To add a new shared block:**

1. Drop `_shared/<name>.md` (just the body, no markers)
2. In each SKILL.md that should opt in, wrap the region with `<!-- shared:<name>-start -->` and `<!-- shared:<name>-end -->`
3. Run `bash scripts/sync-shared.sh`. Skills without the marker pair are untouched; an unmatched start marker errors out.

**To verify everything is in sync** (e.g., before pushing): `bash scripts/sync-shared.sh --check`. Exits non-zero on drift.

**No starter `template.html`.** Each skill's `SKILL.md` describes the section structure and component choices; `references/design-tokens.md` carries the canonical CSS and component markup. The LLM assembles the final HTML directly from those two — there's no per-skill scaffold file to drift against.
