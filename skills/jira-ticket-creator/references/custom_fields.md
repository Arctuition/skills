# Custom Field Configuration

This document explains how to work with custom fields in Jira when creating tickets.

## Finding Custom Field Names

Custom field names in your Jira instance may differ from the display names. To find the correct field names:

1. Run `jira issue create` interactively (without `--no-input` flag)
2. Observe the field names prompted during the interactive flow
3. Or use: `jira issue view <ISSUE-KEY>` to see field names in an existing issue

## Common Custom Fields in This Setup

Based on the requirements, these custom fields are used:

- **Components**: Set to "Dev" by default
- **Platform**: Set to "Dev" by default

## Setting Custom Fields via CLI

The `--custom` flag accepts key-value pairs:

```bash
jira issue create -tStory -s"Summary" -b"Description" \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```

## Setting Status to Backlog

Note: In Jira, you typically cannot set the initial status during creation - issues are created in the default status (usually "To Do" or "Open"). To move to "Backlog" status after creation:

```bash
# Create the issue
ISSUE_KEY=$(jira issue create -tStory -s"Summary" -b"Description" --no-input | grep -oE '[A-Z]+-[0-9]+')

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
  -s"Fix login error on mobile" \
  -b"Users cannot log in on iOS devices when using Face ID" \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```

### Story
```bash
jira issue create -tStory \
  -s"Add user profile page" \
  -b"As a user, I want to view and edit my profile information" \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```

### Epic
```bash
jira issue create -tEpic \
  -s"Mobile App Redesign Q1 2024" \
  -b"Complete redesign of mobile app with new UI/UX" \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```

### Story with Parent Epic
```bash
jira issue create -tStory \
  -s"Update home screen layout" \
  -b"Implement new home screen design from mockups" \
  -P PROJ-123 \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```

## Retrieving Ticket URL

After creation, jira-cli outputs the issue key (e.g., `PROJ-123`). To get the full URL:

1. Open in browser directly: Press `ENTER` in the issue list or use `jira open PROJ-123`
2. View issue details: `jira issue view PROJ-123`
3. Copy URL: In the issue list view, press `c` to copy URL to clipboard

The URL format is typically: `https://your-domain.atlassian.net/browse/PROJ-123`
