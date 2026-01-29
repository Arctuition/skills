# Claude Code Development Guide

This document provides guidance for Claude Code agents working with the ArcSite skills repository.

## Repository Structure

```
skills/
├── skill-name/
│   ├── SKILL.md              # Skill definition with YAML frontmatter
│   └── references/           # Supporting documentation
│       ├── example.md
│       └── api-reference.md
```

## Creating New Skills

### 1. Directory Setup

Create a new directory under `skills/` with a descriptive kebab-case name:
```bash
mkdir -p skills/new-skill-name/references
```

### 2. SKILL.md Format

Every skill must have a `SKILL.md` file with this structure:

```markdown
---
name: skill-name
description: "Clear, concise description of when to use this skill. Include specific trigger phrases and use cases."
---

# Skill Title

Brief overview of what this skill does.

## Prerequisites

List required tools, environment variables, and access requirements.

## Workflow

Step-by-step instructions for executing the skill:

1. **Step Name**
   - Clear action items
   - Example commands with placeholders
   - Expected outputs

2. **Next Step**
   - Continue the workflow
   - Include error handling

## Examples

Provide concrete examples:
```bash
command example here
```

## Troubleshooting

Common issues and solutions.
```

### 3. YAML Frontmatter Guidelines

```yaml
---
name: skill-name          # Kebab-case, matches directory name
description: "1-2 sentences describing when to use this skill. Be specific about trigger conditions and use cases."
---
```

The description field is critical - it determines when Claude Code will invoke the skill. Be explicit about:
- Trigger phrases users might say
- Specific workflows it handles
- What tools/APIs it integrates with

### 4. References Directory

Store supporting documentation in `references/`:
- API documentation
- Command references
- Configuration examples
- Decision trees or flowcharts

Reference these files in the main SKILL.md:
```markdown
See [references/api-reference.md](references/api-reference.md) for details.
```

## Skill Development Patterns

### Use Clear Command Templates

Provide exact command templates with clear placeholder syntax:

```bash
curl "https://api.example.com/v1/<RESOURCE_ID>" \
  -H "Authorization: Bearer $API_TOKEN"
```

Use `<ANGLE_BRACKETS>` for user-provided values and `$ENV_VARS` for environment variables.

### Structure Workflows Sequentially

Number each step and use bold headers:

1. **Parse Input**
2. **Validate Prerequisites**
3. **Execute Primary Action**
4. **Handle Response**
5. **Provide Output**

### Include Error Handling

Document common failure modes and recovery steps:

```markdown
If authentication fails, inform the user:
"Please set your API token: `export API_TOKEN=your_token_here`"
```

### Provide Complete Examples

Always include end-to-end examples showing:
- Input format
- Command execution
- Expected output
- How to interpret results

### Handle Optional Dependencies

If a tool is optional (like `jq`), provide alternatives:

```markdown
If jq is available, extract specific fields:
```bash
curl ... | jq -r '.field'
```

If jq is not available, work with the raw JSON response directly.
```

## Integration Best Practices

### API Integrations

- Always check for required authentication tokens first
- Provide clear instructions for obtaining credentials
- Use standard authentication patterns (Bearer tokens, API keys)
- Handle rate limiting and error responses

### CLI Tool Integrations

- Document installation commands for each platform
- Verify tool is installed before attempting to use it
- Use `--no-input` or non-interactive modes when possible
- Capture and parse command output reliably

### Multi-Step Workflows

For complex workflows:
1. Break into discrete, testable steps
2. Validate each step before proceeding
3. Store intermediate results in variables
4. Provide rollback or cleanup instructions if needed

## Testing Considerations

When developing skills, consider:
- Can this be tested without side effects?
- Are there dry-run or preview modes?
- What validation can be done before executing?
- How do we verify successful completion?

## Code Quality Standards

### Clarity Over Cleverness

Prefer explicit, readable commands over compact one-liners:

**Good:**
```bash
ISSUE_KEY=$(jira issue create -tStory -s"Summary" --no-input | grep -oE '[A-Z]+-[0-9]+' | head -1)
jira issue move "$ISSUE_KEY" "Backlog"
```

**Avoid:**
```bash
jira issue create ... | tee >(grep -oE '[A-Z]+-[0-9]+' | head -1 | xargs -I {} jira issue move {} "Backlog")
```

### Defensive Programming

- Check prerequisites before running commands
- Validate inputs match expected formats
- Provide helpful error messages
- Don't assume tools are installed or configured

### Documentation

- Keep documentation in sync with implementation
- Update examples when command syntax changes
- Document breaking changes in commit messages
- Include version requirements for external tools

## File Modifications

When working with existing skills:

1. **Always read the file first** using the Read tool
2. **Understand the current workflow** before making changes
3. **Preserve existing patterns** unless explicitly refactoring
4. **Update references** if you change command syntax
5. **Test the complete workflow** after modifications

## Commit Guidelines

When committing changes to skills:

```bash
git add skills/skill-name/
git commit -m "$(cat <<'EOF'
Update skill-name: brief description of change

- Specific change 1
- Specific change 2

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

## Common Pitfalls

1. **Overly generic descriptions**: The description field must be specific enough for Claude to know when to invoke the skill
2. **Missing prerequisites**: Always document required tools, tokens, and access
3. **Incomplete examples**: Users should be able to copy-paste and run examples
4. **Assuming context**: Don't assume users have prior knowledge of the integrated tools
5. **Skipping error handling**: Always address common failure modes

## Skill Categories

Current skill categories in this repository:

- **Issue Management**: Sentry integration, bug analysis
- **Project Management**: Jira ticket creation and management
- **Code Review**: PR reviews, code analysis
- **Documentation**: Wiki generation, knowledge graphs
- **Development Workflow**: Learning paths, planning tools

When creating new skills, consider which category they fit into and follow existing patterns from that category.
