# Component Selection Guide

This document explains how to select the appropriate component when creating Jira tickets.

## Available Components

Use the `-C` flag to specify a component:

- **API**: REST API endpoints, API design, external integrations
- **Projects**: Project-related features, project management functionality
- **Proposals**: Proposal features, proposal workflows
- **Backends**: Backend services, database, server-side logic, caching, performance
- **Regression**: Bug fixes, regression issues, quality assurance
- **AI**: AI/ML features, intelligent automation, ChatGPT integrations

## Component Selection Examples

| Ticket Description (Problem-focused) | Component | Reason |
|---|-----------|---------|
| "Project list page is too slow for power users" | Backends | Performance problem |
| "External partners need self-service access to project data" | API | External data access |
| "Users on Safari cannot log in" | Regression | User-facing bug |
| "Users need AI-powered help drafting proposals" | AI | AI-assisted workflow |
| "Proposal approval process is manual and error-prone" | Proposals | Proposal workflow problem |
| "No visibility into project health across teams" | Projects | Project visibility gap |

## Setting Component via CLI

Use the `-C` flag with the component name:

```bash
jira issue create -tStory -s"Summary" -b"Description" \
  -C Backends \
  --no-input
```

**Important**:
- Component names are case-sensitive
- Use exactly: API, Projects, Proposals, Backends, Regression, or AI
- Always analyze the ticket content to select the most appropriate component

## Setting Status to Backlog

Note: In Jira, you typically cannot set the initial status during creation - issues are created in the default status (usually "To Do" or "Open"). To move to "Backlog" status after creation:

```bash
# Create the issue with appropriate component
ISSUE_KEY=$(jira issue create -tStory -s"Summary" -b"Description" \
  -C Backends --no-input | grep -oE '[A-Z]+-[0-9]+')

# Move to Backlog
jira issue move "$ISSUE_KEY" "Backlog"
```

Alternatively, configure your Jira project to have "Backlog" as the default initial status for new issues.

## Work Types

Supported work types for this skill:
- Epic
- Story
- Bug
- A/B Test (if this is a custom issue type in your Jira instance)

## Example: Creating Different Ticket Types

### Bug
```bash
jira issue create -tBug \
  -s"Users with Face ID cannot log in to the app" \
  -b"Face ID users are unable to authenticate, blocking them from accessing the platform on supported devices." \
  -C Regression \
  --no-input
```

### Story
```bash
jira issue create -tStory \
  -s"External partners need self-service access to project data" \
  -b"Partners currently rely on manual email requests for project data, creating delays and extra workload for the team." \
  -C API \
  --no-input
```

### Epic
```bash
jira issue create -tEpic \
  -s"Help users work faster with AI-powered assistance" \
  -b"Users spend significant time on repetitive tasks. AI-powered features could automate workflows and surface actionable insights." \
  -C AI \
  --no-input
```

### Story with Parent Epic
```bash
jira issue create -tStory \
  -s"Proposal page freezes when loading large datasets" \
  -b"Users with 100+ proposals experience page freezes lasting 5-10 seconds, disrupting their workflow and causing frustration." \
  -P PROJ-123 \
  -C Backends \
  --no-input
```

## Retrieving Ticket URL

After creation, jira-cli outputs the issue key (e.g., `PROJ-123`). To get the full URL:

1. Open in browser directly: Press `ENTER` in the issue list or use `jira open PROJ-123`
2. View issue details: `jira issue view PROJ-123`
3. Copy URL: In the issue list view, press `c` to copy URL to clipboard

The URL format is typically: `https://your-domain.atlassian.net/browse/PROJ-123`
