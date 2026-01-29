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

| Ticket Description | Component | Reason |
|-------------------|-----------|---------|
| "Optimize query performance with Redis" | Backends | Performance and caching |
| "Create project REST API endpoint" | API | API development |
| "Fix login bug on Safari" | Regression | Bug fix |
| "Add ChatGPT integration" | AI | AI feature |
| "Implement proposal approval workflow" | Proposals | Proposal feature |
| "Add project dashboard" | Projects | Project feature |

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
  -s"Fix login error" \
  -b"Users cannot log in when using Face ID authentication" \
  -C Regression \
  --no-input
```

### Story
```bash
jira issue create -tStory \
  -s"Add project REST API endpoint" \
  -b"As a developer, I want a REST API to access project data" \
  -C API \
  --no-input
```

### Epic
```bash
jira issue create -tEpic \
  -s"AI Integration Q1 2024" \
  -b"Integrate AI capabilities across the platform" \
  -C AI \
  --no-input
```

### Story with Parent Epic
```bash
jira issue create -tStory \
  -s"Optimize database queries for proposals" \
  -b"Implement query optimization and caching for proposal data" \
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
