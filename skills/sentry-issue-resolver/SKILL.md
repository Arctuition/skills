---
name: sentry-issue-resolver
description: "Analyze and resolve Sentry issues by fetching detailed issue information, performing deep root cause analysis, and providing actionable solutions. Use when the user asks to: (1) Analyze a Sentry issue, (2) Debug or investigate a Sentry error, (3) Fix a Sentry issue, (4) Get root cause analysis for application errors, (5) Resolve Sentry alerts. Works with Sentry URLs to fetch stack traces, error context, and event data."
---

# Sentry Issue Resolver

Fetch Sentry issues, analyze root causes, and provide actionable solutions using sentry-cli.

## Workflow

When the user requests Sentry issue analysis:

1. **Parse the Sentry URL**
   - Extract org from subdomain (e.g., `arcsite` from `arcsite.sentry.io`)
   - Extract issue ID from path (e.g., `7219768209` from `/issues/7219768209/`)
   - Extract project from query parameter (e.g., `1730879` from `?project=1730879`)

   Example URL: `https://arcsite.sentry.io/issues/7219768209/?project=1730879`

2. **Fetch Issue Data**

   Use sentry-cli to fetch the issue:
   ```bash
   sentry-cli issues list -i <ISSUE_ID> -o <ORG> -p <PROJECT>
   ```

   Example:
   ```bash
   sentry-cli issues list -i 7219768209 -o arcsite -p 1730879
   ```

3. **Analyze the Issue**
   - Examine the stack trace for the error location
   - Identify the error type and message
   - Review the error context (request data, user actions, environment)
   - Look for patterns in the events (frequency, affected users, common paths)
   - Trace the execution flow to find the root cause

4. **Provide Deep Root Cause Analysis**

   Include in the analysis:
   - **Error Summary**: What went wrong (error type, message, affected file/function)
   - **Root Cause**: Why it happened (logical error, null reference, race condition, etc.)
   - **Context**: When/where it occurs (specific user actions, endpoints, environments)
   - **Impact**: Severity and user experience implications
   - **Code Location**: Specific file paths and line numbers from stack trace

5. **Suggest Solutions**

   Provide 1-2 actionable solutions:
   - **Solution 1**: The most direct fix (e.g., add null check, fix logic error)
   - **Solution 2**: Alternative approach or preventive measure (e.g., refactor, add validation)

   Each solution should include:
   - Clear description of the fix
   - Specific code changes or implementation steps
   - Trade-offs or considerations

6. **Output Format**

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

## Sentry CLI Commands

**List issue details:**
```bash
sentry-cli issues list -i <ISSUE_ID> -o <ORG> -p <PROJECT>
```

**List events for the project:**
```bash
sentry-cli events list -o <ORG> -p <PROJECT>
```

**Get additional context (if needed):**
```bash
# List all issues in the project
sentry-cli issues list -o <ORG> -p <PROJECT>

# View organization info
sentry-cli info
```

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

## Prerequisites

- sentry-cli installed (`brew install getsentry/tools/sentry-cli` or `npm install -g @sentry/cli`)
- Authenticated with Sentry (`sentry-cli login`)
- Access to the Sentry organization (typically arcsite)
