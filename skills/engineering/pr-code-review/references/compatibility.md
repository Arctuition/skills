# Compatibility and regression review

Read this when the PR changes API responses, request or schema fields, serializers, templates, tenant-gated behavior, dependencies, or app-facing contracts, when it deletes code in bulk, or when the user asks to review only for regressions ("make sure nothing breaks", "保证没有 regression").

When the user limits scope to regressions, report only concrete compatibility and correctness risks; skip design, convention, and test-value findings unless they directly break existing behavior after merge.

## Establish the old contract

A finding needs a concrete old-vs-new delta and a reachable consumer or workflow. Derive the old behavior from the base revision, callers, tests, generated clients, docs, persisted data, templates, and migrations. For large PRs, first group changed files by the contract surface they touch.

For deletions, search removed symbols across runtime code, scripts, templates, tests, config, docs, and generated assets. When the GitHub diff API fails on a large PR, use local `git diff`, `git show`, and `rg` against the captured base and head SHAs.

## Surfaces to check

- **Response shape:** envelope, status and error codes, headers, cookies, pagination, safe serialization of large-integer IDs, empty success bodies, `null` vs `{}` vs an absent field, and error bodies.
- **Request contract:** methods, auth context, and which fields stay optional or nullable for existing callers.
- **Schema fields:** renames keep aliases while persisted, cached, or serialized callers still send the old name; new required or non-null fields need backfill and client updates; check changed defaults, enum values, and old values still stored in DB, cache, or templates.
- **Patch and versioned data:** patch APIs distinguish absent (leave or inherit), empty (clear), and provided (replace); creating a new version copies or merges per-version metadata; old rows stay readable.
- **Client/server contract:** frontend types, backend serializers, generated clients, and app or mobile payloads. Treat app-facing docs as part of the contract; an intentional contract change updates them in the same PR.
- **Tenant-specific routing:** when behavior is gated on `org_id`, a feature flag, a customer, or an integration, the risk is the non-targeted path. Confirm the shared base path stays generic and other consumers see no change.
- **Stateful behavior:** validation before mutation, idempotency, auth/session/cookie handling, retries, async error propagation, and fallback paths.
- **Frontend state:** render triggers, cache invalidation and refetch, fallback branches, and previously supported user flows, not only TypeScript shape.
- **Dependencies and toolchain:** check release notes against direct usage in the repository. "Latest" is not automatically compatible; runtime majors, peer dependencies, and lockfile resolution can require pinning back.

## Not a regression

- New fields that are optional or safely defaulted for existing callers.
- Internal refactors that keep the request and response contract identical.
- Dependency bumps whose used API is unchanged.
- Docs, test, or comment changes that do not alter behavior.
- Adjacent helpers outside the requested scope: preserve their behavior, but do not treat them as the same contract unless the user widened scope.
- Dirty merge state or missing CI by themselves.
- A contract change with no active consumer that the user explicitly accepts, provided all in-repo clients and docs change together.

State uncertain contract assumptions as open questions or residual risk, not findings. With no findings, report the validation performed and remaining risk, such as pending CI or untested external consumers.

## Past cases

Use these as patterns to match, not as facts about the current repository.

- **Response wrapper refactor (`cloudservice` PR 5238):** replacing legacy response helpers with `ApiResponse` and direct returns broke safe-ID serialization where legacy `serialize()` was dropped; turned `make_success(None)` into a decorator returning `None` where clients expected `data: null`; and in follow-up passes produced double-wrapped results, a raw dict instead of the wrapper, and `result.get("data")` returning `null` without a fallback. Compare exact old and new payloads for every touched view, because these breaks turned up across several review passes, not all at once.
- **Persisted template callers:** a renamed Jinja macro parameter (`show_markup`) was still passed by persisted or cached proposal templates. Updating checked-in callers alone did not fix it; a compatibility alias did.
- **Adjacent helper:** a request to let `round_to_decimal` accept strings also changed `to_decimal(float)`, which review flagged as a breaking change.
- **Optional field default:** the lite PDF drawing contract added `drawing.is_landscape?: boolean`, defaulting to `true` when omitted, with docs updated in the same change.
- **Patch semantics:** PDF navigation metadata on file add/update APIs needed absent-vs-empty handling and copy-forward to new file versions.
- **Tenant routing (`cloudservice` PR 5116):** a Salesforce QuoteLineItem subclass for one org wrote `Quote_Description__c` instead of `Description`. It was safe because dispatch was gated on `org_id`, the shared DTO stayed org-agnostic, and the change was verified in that org's sandbox.
- **Dependencies:** the latest `@testing-library/jest-dom` broke shared frontend tests; type packages had to match the repo's Node and Express majors; `aiohttp` and `pypdf` bumps were checked against direct usage and release notes.
- **Frontend state:** a product bundle child submit mutated nested data in place without triggering a parent re-render, leaving the UI on the old branch.
