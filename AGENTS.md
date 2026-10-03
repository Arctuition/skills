# Skill authoring

## Layout and discovery

```text
skills/<skill-name>/
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

Keep descriptions short and specific to task selection; put workflow defaults and authorization details in the body. Do not turn ordinary reviews, summaries, or explanations into a different deliverable through overly broad triggers.

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

