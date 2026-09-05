---
name: sentry-issue-resolver
description: Investigate or fix a Sentry issue using its URL or issue ID, event details, and the affected source code. Use for Sentry error analysis, root-cause diagnosis, and requested fixes.
---

# Sentry Issue Resolver

Establish the failure from live event evidence, then trace it through the relevant source. An analysis request ends with findings and a proposed fix; implement when the user requests a fix. Do not change Sentry issue status without authorization.

## Obtain evidence

Use an available authenticated Sentry connector, or the REST API below. Resolve the organization and issue from the supplied URL; preserve the host for self-hosted installations.

For REST, check prerequisites without displaying credentials:

```bash
command -v curl
test -n "$SENTRY_AUTH_TOKEN"
```

If authentication is missing, explain how to configure it without asking the user to paste the token into chat. Do not log authorization headers.

List issue events and retrieve a relevant full event:

```bash
curl --fail-with-body --silent --show-error \
  "https://sentry.io/api/0/organizations/<ORG_SLUG>/issues/<ISSUE_ID>/events/" \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN"

curl --fail-with-body --silent --show-error \
  "https://sentry.io/api/0/organizations/<ORG_SLUG>/issues/<ISSUE_ID>/events/<EVENT_ID>/" \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN"
```

Honor any requested event, environment, or time window. Use additional events or pagination when needed to establish a pattern; do not infer frequency or affected-user counts from a single sample.

Inspect the actual response schema. In issue-event REST responses, exception data is under `entries[]` where `type == "exception"`; do not assume the SDK's top-level `exception.values` shape. For a saved response:

```bash
jq '.entries[] | select(.type == "exception") | .data.values[] |
  {type, value, frames: .stacktrace.frames}' "<EVENT_JSON>"
```

Keep event ID/time, release, environment, transaction, breadcrumbs, and relevant request context with the stack trace. Share only the contextual fields needed to explain the failure.

## Diagnose and fix

- Compare the event's deployed release with the inspected source. A merged fix may not have reached the affected worker or frontend release.
- Follow application frames and callers to establish the triggering input or state. Inspect the frame data instead of assuming the first frame is the throw site.
- Separate confirmed evidence from hypotheses and state what would distinguish competing explanations.
- For a requested fix, preserve existing contracts, make the smallest supported change, and run proportionate validation. Distinguish local verification from deployment or production recovery.

Report the failure, trigger and impact, cause with code locations, and the fix or next diagnostic step. Avoid filling a fixed report template or manufacturing a second solution.

## API references

Consult these when adapting an API call:
- [List an issue's events](https://docs.sentry.io/api/events/list-an-issues-events/)
- [Retrieve an issue event](https://docs.sentry.io/api/events/retrieve-an-issue-event/)
