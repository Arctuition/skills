---
name: jira-ticket-creator
description: Create Jira tickets using jira-cli (https://github.com/ankitpokhrel/jira-cli). Use when the user asks to create Jira tickets, issues, or stories with work types (Epic/Story/Bug/A/B Test), set to Backlog status, with Components and Platform set to Dev. Returns the ticket URL after creation. Assumes jira-cli is already installed and configured (user has run 'jira init').
---

# Jira Ticket Creator

Create Jira tickets non-interactively using the jira-cli tool with proper custom field handling.

## Prerequisites

Before using this skill, ensure:
- jira-cli is installed: `brew install jira-cli` or download from [releases](https://github.com/ankitpokhrel/jira-cli/releases)
- Authentication is configured: User has run `jira init` and set up API token
- User has access to the target Jira project

## Quick Start

To create a Jira ticket, use the jira-cli command with the following pattern:

```bash
jira issue create \
  -t<TYPE> \
  -s"<SUMMARY>" \
  -b"<DESCRIPTION>" \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```

### Supported Work Types

- `Epic` - For large initiatives or themes
- `Story` - For user stories and features
- `Bug` - For defects and issues
- `A/B Test` - For A/B testing tasks (if configured in your Jira instance)

## Creating Tickets

### Basic Ticket Creation

For standard ticket creation without a parent epic:

```bash
jira issue create \
  -tStory \
  -s"Add user authentication" \
  -b"Implement JWT-based authentication for API endpoints" \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```

### Ticket with Parent Epic

To link a story/bug to an epic, use the `-P` flag:

```bash
jira issue create \
  -tStory \
  -s"Update login UI" \
  -b"Modernize the login page design" \
  -P PROJ-123 \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```

### Epic Creation

```bash
jira issue create \
  -tEpic \
  -s"Q1 2024 Mobile Redesign" \
  -b"Complete redesign of mobile application with new branding" \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```

### Bug Creation

```bash
jira issue create \
  -tBug \
  -s"Login fails on Safari" \
  -b"Users cannot log in when using Safari browser on macOS. Error message: 'Invalid credentials'" \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```

## Setting Status to Backlog

**Important**: Jira typically creates issues in the default initial status (usually "To Do" or "Open"). To move a newly created ticket to "Backlog" status:

### Two-Step Process

```bash
# Step 1: Create the ticket and capture the issue key
ISSUE_KEY=$(jira issue create -tStory -s"Summary" -b"Description" \
  --custom "Components=Dev" --custom "Platform=Dev" --no-input \
  | grep -oE '[A-Z]+-[0-9]+' | head -1)

# Step 2: Move to Backlog status
jira issue move "$ISSUE_KEY" "Backlog"
```

### Alternative: Configure Default Status

Ask the Jira administrator to set "Backlog" as the default initial status for the project, eliminating the need for the move step.

## Getting the Ticket URL

After creating a ticket, jira-cli outputs the issue key (e.g., `PROJ-123`). To get the full URL:

### Method 1: Open in Browser
```bash
jira open PROJ-123
```

### Method 2: View Issue Details
```bash
jira issue view PROJ-123
```
The output includes the issue URL.

### Method 3: Construct URL Manually
If you know your Jira domain:
```
https://your-domain.atlassian.net/browse/PROJ-123
```

### Method 4: Copy from CLI
When viewing issues in the interactive list:
- Press `ENTER` to open in browser
- Press `c` to copy URL to clipboard

## Helper Script

For complex workflows, use the included helper script:

```bash
python scripts/create_ticket.py \
  -t Story \
  -s "Add user authentication" \
  -b "Implement JWT-based authentication for API endpoints" \
  -c Dev \
  -p Dev
```

Optional: Link to a parent epic:
```bash
python scripts/create_ticket.py \
  -t Story \
  -s "Update login UI" \
  -b "Modernize the login page design" \
  -P PROJ-123
```

## Complete Workflow Example

Create a ticket with all required fields and get the URL:

```bash
# Create the ticket
OUTPUT=$(jira issue create \
  -tStory \
  -s"Implement user dashboard" \
  -b"Create a dashboard showing user activity metrics and recent actions" \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input)

# Extract the issue key
ISSUE_KEY=$(echo "$OUTPUT" | grep -oE '[A-Z]+-[0-9]+' | head -1)

# Move to Backlog
jira issue move "$ISSUE_KEY" "Backlog"

# Get and display the URL
echo "Ticket created: https://your-domain.atlassian.net/browse/$ISSUE_KEY"

# Or open directly in browser
jira open "$ISSUE_KEY"
```

## Custom Fields Reference

For detailed information about custom field configuration and troubleshooting, see [references/custom_fields.md](references/custom_fields.md).

## Troubleshooting

### Authentication Errors
If you get authentication errors, reconfigure jira-cli:
```bash
jira init
```

### Custom Field Not Found
If "Components" or "Platform" fields are not recognized:
1. Run `jira issue create` interactively to see available field names
2. Check field names in an existing issue: `jira issue view PROJ-123`
3. Update the `--custom` flag with the correct field names

### Invalid Issue Type
If "A/B Test" is not recognized, verify it's configured in your Jira project:
1. Check available types: Run `jira issue create` and observe the type options
2. Use a standard type (Epic/Story/Bug) if A/B Test is not available

## Examples by Use Case

### User requests: "Create a bug ticket for the login issue"
```bash
jira issue create \
  -tBug \
  -s"Login fails on Safari browser" \
  -b"Users report they cannot log in when using Safari. The login button appears unresponsive." \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```

### User requests: "Create an epic for the mobile redesign project"
```bash
jira issue create \
  -tEpic \
  -s"Mobile App Redesign Initiative" \
  -b"Comprehensive redesign of the mobile application including new UI/UX, performance improvements, and feature additions" \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```

### User requests: "Create a story under epic PROJ-456 for the profile page"
```bash
jira issue create \
  -tStory \
  -s"Build user profile page" \
  -b"As a user, I want to view and edit my profile information including avatar, bio, and contact details" \
  -P PROJ-456 \
  --custom "Components=Dev" \
  --custom "Platform=Dev" \
  --no-input
```
