---
name: sentry-issue-resolver
description: "Analyze and resolve Sentry issues by fetching detailed issue information, performing deep root cause analysis, and providing actionable solutions. Use when the user asks to: (1) Analyze a Sentry issue, (2) Debug or investigate a Sentry error, (3) Fix a Sentry issue, (4) Get root cause analysis for application errors, (5) Resolve Sentry alerts. Works with Sentry URLs to fetch stack traces, error context, and event data."
---

# Sentry Issue Resolver

Fetch Sentry issues with complete stack traces, analyze root causes, and provide actionable solutions using the Sentry CLI.

## Prerequisites

### Sentry CLI Installation

Install the Sentry CLI using one of these methods:

**Recommended (shell script):**
```bash
curl https://cli.sentry.dev/install -fsS | bash
```

**Alternative methods:**
```bash
# Using npm
npm install -g @sentry/cli

# Using npx (no installation)
npx @sentry/cli <command>
```

### Authentication

Authenticate with Sentry using the OAuth device flow (recommended):
```bash
sentry auth login
```

This will open a browser window for you to authorize the CLI. The credentials will be saved for future use.

**Alternative: Token-based authentication**
```bash
sentry auth login --token YOUR_TOKEN_HERE
```

You can create a token at: https://sentry.io/settings/account/api/auth-tokens/

### Verify Authentication

Check your authentication status:
```bash
sentry auth status
```

This will show your authenticated organization and user.

## Workflow

When the user requests Sentry issue analysis:

1. **Parse the Sentry URL**
   - Extract org slug from subdomain (e.g., `arcsite` from `arcsite.sentry.io`)
   - Extract issue ID from path (e.g., `7219768209` from `/issues/7219768209/`)

   Example URL: `https://arcsite.sentry.io/issues/7219768209/?project=1730879`

2. **Check Authentication**

   Verify that you're authenticated:
   ```bash
   sentry auth status
   ```

   If not authenticated, run:
   ```bash
   sentry auth login
   ```

3. **Fetch Issue Details**

   Get the issue details including the latest event:
   ```bash
   sentry issue view <ISSUE_ID> --json
   ```

   Example:
   ```bash
   sentry issue view 7219768209 --json
   ```

   This returns:
   - Issue metadata (title, status, frequency)
   - Latest event ID
   - Tags and context
   - First and last seen timestamps

   To open the issue in your browser for visual inspection:
   ```bash
   sentry issue view 7219768209 -w
   ```

4. **Fetch Complete Event Details**

   Get the full event details including stack trace for analysis:
   ```bash
   sentry event view <EVENT_ID> --json
   ```

   Example:
   ```bash
   sentry event view abc123def456 --json
   ```

   The response includes:
   - `exception.values[].stacktrace.frames[]` - Complete stack trace with file paths, line numbers, and function names
   - `exception.values[].type` and `exception.values[].value` - Error type and message
   - `tags`, `user`, `request` - Context data
   - `context` - Additional environment and runtime information

   **Fallback if event ID is not available:**
   If you need to use the Sentry API directly:
   ```bash
   sentry api /organizations/<ORG>/issues/<ISSUE_ID>/events/<EVENT_ID>/
   ```

5. **Analyze the Issue**
   - Examine the stack trace for the error location
   - Identify the error type and message
   - Review the error context (request data, user actions, environment)
   - Look for patterns in the events (frequency, affected users, common paths)
   - Trace the execution flow to find the root cause

6. **Provide Deep Root Cause Analysis**

   Include in the analysis:
   - **Error Summary**: What went wrong (error type, message, affected file/function)
   - **Root Cause**: Why it happened (logical error, null reference, race condition, etc.)
   - **Context**: When/where it occurs (specific user actions, endpoints, environments)
   - **Impact**: Severity and user experience implications
   - **Code Location**: Specific file paths and line numbers from stack trace

7. **Suggest Solutions**

   Provide 1-2 actionable solutions:
   - **Solution 1**: The most direct fix (e.g., add null check, fix logic error)
   - **Solution 2**: Alternative approach or preventive measure (e.g., refactor, add validation)

   Each solution should include:
   - Clear description of the fix
   - Specific code changes or implementation steps
   - Trade-offs or considerations

8. **Output Format**

   Structure the response as:

   ```
   ## Sentry Issue Analysis: [ISSUE_ID]

   ### Error Summary
   [Brief description of what went wrong]

   ### Root Cause
   [Deep analysis of why this happened]

   ### Context
   - Frequency: [how often it occurs]
   - Affected: [users, endpoints, environments]
   - Trigger: [what action causes it]

   ### Impact
   [Severity and user experience impact]

   ### Code Location
   [File paths and line numbers from stack trace]

   ### Suggested Solutions

   #### Solution 1: [Direct Fix]
   [Description and implementation]

   #### Solution 2: [Alternative/Preventive]
   [Description and implementation]
   ```

## Sentry CLI Commands Reference

### Authentication Commands

**Check authentication status:**
```bash
sentry auth status
```

**Login with OAuth (recommended):**
```bash
sentry auth login
```

**Login with token:**
```bash
sentry auth login --token YOUR_TOKEN_HERE
```

**Logout:**
```bash
sentry auth logout
```

### Issue Commands

**View issue details:**
```bash
sentry issue view <ISSUE_ID> [--json] [-w]
```
- `--json` - Output as JSON for programmatic processing
- `-w` - Open in web browser

**List issues:**
```bash
sentry issue list --org <ORG> --project <PROJ> [--json] [--status unresolved|resolved|ignored] [--query "search terms"] [--limit N]
```

Examples:
```bash
# List unresolved issues in a project
sentry issue list --org arcsite --project my-app --status unresolved

# Search for specific error type
sentry issue list --org arcsite --project my-app --query "TypeError"
```

### Event Commands

**View event details:**
```bash
sentry event view <EVENT_ID> [--json] [-w]
```
- `--json` - Output as JSON for programmatic processing
- `-w` - Open in web browser

### Direct API Access

**For advanced use cases, call Sentry API directly:**
```bash
sentry api <endpoint> [--method GET|POST|PUT|DELETE] [--field key=value] [--include] [--paginate]
```

Examples:
```bash
# Get event details via API
sentry api /organizations/arcsite/issues/7219768209/events/abc123/

# List events for an issue
sentry api /organizations/arcsite/issues/7219768209/events/
```

## Working with CLI Output

### JSON Output Structure

**Issue View (`sentry issue view --json`):**
- `id` - Issue ID
- `title` - Issue title/error message
- `metadata.type` - Error type
- `metadata.value` - Error value
- `count` - Number of events
- `userCount` - Number of affected users
- `status` - Issue status (unresolved, resolved, ignored)
- `latestEvent.id` - Latest event ID
- `firstSeen`, `lastSeen` - Timestamps

**Event View (`sentry event view --json`):**
- `eventID` - Event ID
- `exception.values[].type` - Exception type
- `exception.values[].value` - Exception message
- `exception.values[].stacktrace.frames[]` - Stack trace frames
  - Each frame has: `filename`, `lineno`, `function`, `context_line`, `pre_context`, `post_context`
- `tags` - Event tags (environment, release, etc.)
- `user` - User information
- `request` - HTTP request details
- `context` - Additional runtime context

### Typical Workflow

1. View the issue to get metadata and latest event ID:
   ```bash
   sentry issue view 7219768209 --json
   ```

2. Extract the latest event ID from the response

3. View the event details to get full stack trace:
   ```bash
   sentry event view <EVENT_ID> --json
   ```

4. Analyze the stack trace from `exception.values[0].stacktrace.frames`
   - Frames are ordered from innermost (where error occurred) to outermost
   - Look at `context_line`, `pre_context`, and `post_context` for code context

5. Use browser view (`-w` flag) for visual inspection when needed

## Analysis Tips

**Common Error Patterns:**

- **Null/Undefined Reference**: Variable accessed before initialization or after it was set to null
- **Type Error**: Incorrect data type used (string vs number, missing property)
- **Network/Timeout**: Failed API calls, slow responses, connection issues
- **Race Condition**: Async operations completing in unexpected order
- **Logic Error**: Incorrect conditional logic or algorithm implementation
- **Missing Validation**: User input not properly validated or sanitized

**Root Cause Techniques:**

1. **Follow the Stack Trace**: Start from the top (where error was thrown) and trace backward
2. **Check Recent Changes**: Look for recent commits that touched the failing code
3. **Examine Context Data**: Request parameters, user state, environment variables
4. **Pattern Recognition**: Does it only happen for certain inputs, users, or environments?
5. **Timing Analysis**: Does it happen at specific times, after specific actions, or randomly?

## Troubleshooting

**CLI not found:**
- Verify installation: `which sentry` or `sentry --version`
- If installed via npm, ensure npm bin directory is in PATH
- Reinstall using the shell script method

**Authentication issues:**
- Run `sentry auth status` to check current status
- Run `sentry auth logout` then `sentry auth login` to re-authenticate
- Verify you have access to the organization in Sentry web UI

**Issue not found:**
- Verify the issue ID is correct
- Check that you have access to the organization
- Ensure the issue hasn't been deleted

**Event not found:**
- Some old events may be pruned based on retention policy
- Try fetching the latest event from `sentry issue view` output
- Use the API fallback: `sentry api /organizations/<ORG>/issues/<ISSUE_ID>/events/`

**Missing event data:**
- Stack traces may be incomplete if source maps are not configured
- Some context may be redacted based on data scrubbing rules
- Check Sentry project settings for SDK configuration issues
