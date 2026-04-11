---
name: jira-ticket-manager
description: Create, search/list, and edit Jira tickets using jira-cli (https://github.com/ankitpokhrel/jira-cli). Use when the user asks to create tickets/issues/stories/bugs/epics (Epic/Story/Bug/A/B Test, set to Backlog), list or search their Jira tickets (e.g. "what am I working on", "show my open bugs", filter by status/type/component or raw JQL), view a specific ticket by key, or edit/update an existing ticket's fields (summary, description, assignee, priority, labels, parent epic). Selects the most appropriate component from API/Projects/Proposals/Backends/Regression/AI for new tickets. Assumes jira-cli is already installed and configured (user has run 'jira init').
---

# Jira Ticket Manager

Create, search, view, and edit Jira tickets non-interactively using the jira-cli tool.

## Writing Good Ticket Summaries & Descriptions

**Focus on the problem being solved, not the technical implementation.**

Tickets should clearly communicate *what problem the user or business faces* and *what outcome is desired*. Technical details (specific technologies, implementation approaches) belong in subtasks or comments — not in the ticket summary or description.

### Summary Guidelines

- **DO**: Describe the user-facing problem or desired outcome
- **DON'T**: Mention specific technologies, libraries, or implementation approaches

| Bad (Tech-focused) | Good (Problem-focused) |
|---|---|
| "Implement Redis caching for project queries" | "Reduce slow load times on project list page" |
| "Add JWT-based authentication to API" | "Users need secure login for the platform" |
| "Migrate database from PostgreSQL to DynamoDB" | "Improve scalability for growing user base" |
| "Refactor proposal service to use async/await" | "Proposal page freezes when loading large datasets" |
| "Add WebSocket support for notifications" | "Users miss important updates because notifications are delayed" |

### Description Guidelines

Structure descriptions around the problem and acceptance criteria:
- **Problem**: What is the current pain point?
- **Impact**: Who is affected and how?
- **Desired Outcome**: What does success look like for the user?

Avoid prescribing specific technical solutions in the description. Let the engineering team decide the best approach.

## Prerequisites

Before using this skill, ensure:
- jira-cli is installed: `brew install jira-cli` or download from [releases](https://github.com/ankitpokhrel/jira-cli/releases)
- Authentication is configured: User has run `jira init` and set up API token
- User has access to the target Jira project

## Available Components

Select the most appropriate component based on the ticket content:

- **API**: REST API endpoints, API design, external integrations
- **Projects**: Project-related features, project management functionality
- **Proposals**: Proposal features, proposal workflows
- **Backends**: Backend services, database, server-side logic, caching, performance
- **Regression**: Bug fixes, regression issues, quality assurance
- **AI**: AI/ML features, intelligent automation, ChatGPT integrations

**Selection Examples:**
- "Project list page loads too slowly" → Backends
- "Users need AI-powered assistance for drafting proposals" → AI
- "External partners need access to project data" → API
- "Users cannot log in on Safari" → Regression
- "Proposal approval process is manual and error-prone" → Proposals
- "No visibility into project progress and health" → Projects

## Quick Start

To create a Jira ticket, use the jira-cli command with the following pattern:

```bash
jira issue create \
  -t<TYPE> \
  -s"<SUMMARY>" \
  -b"<DESCRIPTION>" \
  -C <COMPONENT> \
  --no-input
```

**Example:**
```bash
jira issue create \
  -tStory \
  -s"Project list page takes too long to load for users with many projects" \
  -b"Users with 50+ projects experience 10s+ load times on the project list page, causing frustration and drop-off. The page should load within 2 seconds regardless of project count." \
  -C Backends \
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
  -s"Users need a secure way to access the platform" \
  -b"Currently there is no authentication mechanism, so anyone with the URL can access the platform. Users need to be able to log in securely to protect their data." \
  -C API \
  --no-input
```

### Ticket with Parent Epic

To link a story/bug to an epic, use the `-P` flag:

```bash
jira issue create \
  -tStory \
  -s"Team leads lack visibility into project health and progress" \
  -b"Team leads have no centralized view of project status, making it hard to identify at-risk projects. They need a dashboard showing key metrics and recent activity at a glance." \
  -P PROJ-123 \
  -C Projects \
  --no-input
```

### Epic Creation

```bash
jira issue create \
  -tEpic \
  -s"Enable AI-powered assistance across the platform" \
  -b"Users frequently perform repetitive tasks that could be automated. AI-powered features would reduce manual effort and help users make better decisions faster." \
  -C AI \
  --no-input
```

### Bug Creation

```bash
jira issue create \
  -tBug \
  -s"Users on Safari cannot log in to the platform" \
  -b"Safari users see 'Invalid credentials' when attempting to log in, even with correct credentials. This blocks all Safari users from accessing the platform." \
  -C Regression \
  --no-input
```

## Setting Status to Backlog

**Important**: Jira typically creates issues in the default initial status (usually "To Do" or "Open"). To move a newly created ticket to "Backlog" status:

### Two-Step Process

```bash
# Step 1: Create the ticket and capture the issue key
ISSUE_KEY=$(jira issue create -tStory -s"Summary" -b"Description" \
  -C Backends --no-input | grep -oE '[A-Z]+-[0-9]+' | head -1)

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

## Listing & Searching Tickets

Use `jira issue list` to find tickets. Always pass `--plain` for non-interactive,
parseable output (the default mode opens an interactive TUI).

### My Open Tickets (most common)

```bash
jira issue list -a$(jira me) -s~Done -s~Closed --plain
```

The `~` prefix means "not equal". This shows your tickets that aren't Done/Closed.

When the user asks "what am I working on", "show my tickets", or "what's on my
plate", this is the default query.

### Filter by Status

```bash
# Everything in progress
jira issue list -s"In Progress" --plain

# Everything in the backlog
jira issue list -sBacklog --plain
```

### Filter by Type

```bash
jira issue list -tBug --plain
jira issue list -tStory --plain
jira issue list -tEpic --plain
```

### Filter by Component

```bash
jira issue list -CBackends --plain
jira issue list -CAI --plain
```

### Combine Filters

Filters AND together. Example — "my open bugs in Backends":

```bash
jira issue list -a$(jira me) -tBug -CBackends -s~Done --plain
```

### Created/Updated Recently

```bash
# Created in the last 7 days
jira issue list --created -7d --plain

# Updated in the last 24 hours
jira issue list --updated -1d --plain
```

### Advanced: Raw JQL

For anything the flags don't cover, pass raw JQL with `-q`:

```bash
jira issue list -q "assignee = currentUser() AND priority = High AND status != Done ORDER BY updated DESC" --plain
```

### View a Specific Ticket

When the user references a key directly (e.g. "show me PROJ-123", "what's the
status of PROJ-456"):

```bash
jira issue view PROJ-123
```

The output includes summary, description, status, assignee, comments, and the
issue URL. To open in the browser instead:

```bash
jira open PROJ-123
```

## Editing Tickets

Use `jira issue edit` to update an existing ticket. The field flags mirror those
used by `jira issue create`. Always pass `--no-input` for non-interactive edits.

### Update Summary

```bash
jira issue edit PROJ-123 -s"Clearer, problem-focused summary" --no-input
```

### Update Description

```bash
jira issue edit PROJ-123 -b"Updated problem statement and acceptance criteria..." --no-input
```

When rewriting summaries or descriptions, follow the same problem-focused
guidelines from the [Writing Good Ticket Summaries & Descriptions](#writing-good-ticket-summaries--descriptions)
section above — don't bake implementation details into the ticket.

### Reassign

```bash
# Assign to a specific user
jira issue edit PROJ-123 -a"username" --no-input

# Assign to yourself
jira issue edit PROJ-123 -a$(jira me) --no-input

# Unassign (the literal "x" clears the assignee)
jira issue edit PROJ-123 -ax --no-input
```

### Set Priority

```bash
jira issue edit PROJ-123 -yHigh --no-input
```

Common values: `Highest`, `High`, `Medium`, `Low`, `Lowest` (verify in your Jira instance).

### Add Labels

```bash
jira issue edit PROJ-123 -l"frontend" -l"urgent" --no-input
```

### Link to a Parent Epic

```bash
jira issue edit PROJ-123 -PPROJ-456 --no-input
```

### Update Multiple Fields at Once

```bash
jira issue edit PROJ-123 \
  -s"Updated summary" \
  -yHigh \
  -l"urgent" \
  --no-input
```

### Edit vs. Transition

`jira issue edit` updates **fields**. To change **status** (To Do → In Progress
→ Done), use `jira issue move`:

```bash
jira issue move PROJ-123 "In Progress"
```

## Helper Script

For complex workflows, you can create a helper script if needed:

```bash
#!/bin/bash
# create_jira_ticket.sh
TYPE=$1
SUMMARY=$2
DESCRIPTION=$3
COMPONENT=$4

jira issue create \
  -t"$TYPE" \
  -s"$SUMMARY" \
  -b"$DESCRIPTION" \
  -C "$COMPONENT" \
  --no-input
```

Usage:
```bash
./create_jira_ticket.sh Story "Add authentication" "Implement JWT auth" API
```

## Complete Workflow Example

Create a ticket with all required fields and get the URL:

```bash
# Step 1: Create the ticket (select appropriate component based on the task)
OUTPUT=$(jira issue create \
  -tStory \
  -s"Team leads need a way to monitor project health at a glance" \
  -b"There is no centralized view for tracking project progress. Team leads must check each project individually, which is time-consuming and makes it easy to miss at-risk projects." \
  -C Projects \
  --no-input)

# Step 2: Extract the issue key
ISSUE_KEY=$(echo "$OUTPUT" | grep -oE '[A-Z]+-[0-9]+' | head -1)

# Step 3: Move to Backlog
jira issue move "$ISSUE_KEY" "Backlog"

# Step 4: Get and display the URL
echo "Ticket created: https://your-domain.atlassian.net/browse/$ISSUE_KEY"

# Or open directly in browser
jira open "$ISSUE_KEY"
```

## Component Selection Reference

For detailed guidance on selecting the appropriate component, see [references/component_selection.md](references/component_selection.md).

## Troubleshooting

### Authentication Errors
If you get authentication errors, reconfigure jira-cli:
```bash
jira init
```

### Component Not Found
If a component is not recognized:
1. List available components: `jira component list`
2. Verify the component name matches exactly (case-sensitive)
3. Valid components: API, Projects, Proposals, Backends, Regression, AI

### Invalid Issue Type
If "A/B Test" is not recognized, verify it's configured in your Jira project:
1. Check available types: Run `jira issue create` and observe the type options
2. Use a standard type (Epic/Story/Bug) if A/B Test is not available

## Examples by Use Case

### User requests: "Create a bug ticket for the login issue"
```bash
jira issue create \
  -tBug \
  -s"Safari users cannot log in — login button is unresponsive" \
  -b"Multiple users have reported that the login button does not respond on Safari, preventing them from accessing the platform entirely." \
  -C Regression \
  --no-input
```

### User requests: "Create an epic for AI integration"
```bash
jira issue create \
  -tEpic \
  -s"Help users work faster with AI-powered assistance" \
  -b"Users spend significant time on repetitive tasks like drafting proposals and analyzing project data. AI-powered features could automate these workflows and surface actionable insights." \
  -C AI \
  --no-input
```

### User requests: "Create a story under epic PROJ-456 for project analytics API"
```bash
jira issue create \
  -tStory \
  -s"External partners need programmatic access to project analytics" \
  -b"Partners currently request analytics reports manually via email, which is slow and error-prone. They need a self-service way to retrieve project analytics data on demand." \
  -P PROJ-456 \
  -C API \
  --no-input
```

### User requests: "What am I working on?" / "Show my open tickets"
```bash
jira issue list -a$(jira me) -s~Done -s~Closed --plain
```

### User requests: "Show me my open bugs in Backends"
```bash
jira issue list -a$(jira me) -tBug -CBackends -s~Done --plain
```

### User requests: "Show me PROJ-123" / "What's the status of PROJ-123?"
```bash
jira issue view PROJ-123
```

### User requests: "Reassign PROJ-123 to me and bump priority to High"
```bash
jira issue edit PROJ-123 -a$(jira me) -yHigh --no-input
```

### User requests: "Update the description on PROJ-123"
```bash
jira issue edit PROJ-123 \
  -b"Users with 50+ projects experience 10s+ load times. Target: <2s regardless of count." \
  --no-input
```

### User requests: "Link PROJ-123 to epic PROJ-456"
```bash
jira issue edit PROJ-123 -PPROJ-456 --no-input
```
