# ArcSite Skills

A collection of custom skills for [Claude Code CLI](https://github.com/anthropics/claude-code) that extend Claude's capabilities with specialized workflows and integrations.

## Available Skills

### Sentry Issue Resolver
Analyze and resolve Sentry issues with deep root cause analysis. Fetches complete stack traces, error context, and event data via the Sentry REST API.

**Usage:** Provide a Sentry issue URL
```
Analyze this Sentry issue: https://arcsite.sentry.io/issues/7219768209/
```

### Jira Ticket Creator
Create Jira tickets non-interactively using jira-cli with automatic component selection (API, Projects, Proposals, Backends, Regression, AI).

**Usage:** Request ticket creation
```
Create a bug ticket for login failing on Safari
```

### PR Code Review
Perform comprehensive GitHub pull request reviews using the gh CLI. Provides severity-based analysis (high/medium/low) with inline comments.

**Usage:** Request PR review
```
Review PR #123
```

## Installation

1. Install [Claude Code CLI](https://github.com/anthropics/claude-code)
2. Clone this repository
3. Individual skills may have prerequisites:
   - **Sentry Issue Resolver**: Set `SENTRY_AUTH_TOKEN` environment variable
   - **Jira Ticket Creator**: Install and configure [jira-cli](https://github.com/ankitpokhrel/jira-cli)
   - **PR Code Review**: Install and authenticate [GitHub CLI](https://cli.github.com/)

## Using Skills

Skills are automatically loaded by Claude Code when this repository is in your skills directory. Reference skills by name in your conversations:

```
Use sentry-issue-resolver to analyze https://arcsite.sentry.io/issues/7219768209/
```

Or use the skill name directly:
```
/sentry-issue-resolver https://arcsite.sentry.io/issues/7219768209/
```

## Skill Structure

Each skill is organized in its own directory:
```
skills/
├── skill-name/
│   ├── SKILL.md          # Main skill definition and workflow
│   └── references/       # Supporting documentation and examples
```

## Contributing

To add a new skill:

1. Create a new directory under `skills/`
2. Add a `SKILL.md` file with:
   - YAML frontmatter (name, description)
   - Workflow documentation
   - Examples and prerequisites
3. Add reference materials in a `references/` subdirectory
4. Follow patterns from existing skills

See [CLAUDE.md](CLAUDE.md) for detailed development guidelines.

## License

Internal use for ArcSite development.
