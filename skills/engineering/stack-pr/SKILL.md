---
name: stack-pr
description: Split committed changes on a branch into dependency-ordered GitHub PRs, with a concrete plan before publication. Use for "stack this PR", "split this branch into PRs", "拆 PR", or a request to make a large branch reviewable.
---

# Stack PR

Construct new stacked PRs whose successive bases are the preceding branches. Preserve the original branch, source PR, and unrelated working-tree changes. Updating or replacing an existing stack is outside the default scope.

## Resolve the source and base

```bash
git status --short
git branch --show-current
git remote -v
gh auth status
```

Default to committed changes only. A dirty source checkout does not block building from committed objects in an isolated worktree; never auto-stash or commit the excluded changes.

Use `upstream` as the target remote when it exists, otherwise `origin`. Verify authenticated access and push permission for that target, then fetch it. Resolve the base in this order:
1. User-specified base.
2. Current branch's open PR base.
3. Target remote's default branch, resolved from GitHub or remote refs.

Record source and base SHAs. Use commit history to understand intent and the merge-base diff to identify the source patch:

```bash
git log --oneline "<BASE_REF>..<SOURCE_SHA>"
git merge-base "<BASE_REF>" "<SOURCE_SHA>"
git diff "<MERGE_BASE_SHA>..<SOURCE_SHA>"
```

Do not extract `git diff <BASE_REF>..<SOURCE_SHA>` when the branch has diverged: it includes differences from base advancement. Ignore pure sync merges, but preserve feature-relevant conflict resolutions in the final source tree.

## Design the stack

Read changed code and its dependencies. Group changes into cohesive, independently reviewable layers; commit boundaries are useful only when they match the intended scopes.

Prefer small layers, with roughly 400 changed lines as a sizing hint rather than a correctness rule. Keep indivisible schema/consumer or behavioral changes together. Do not add refactors, formatting churn, or new behavior to make the split convenient.

Infer a content-based prefix and names such as `<PREFIX>/01-<SCOPE>`. Check local and remote names and select a non-conflicting prefix; never overwrite an existing stack.

For each layer, identify its parent, scope, key files, extraction method, and validation. Cherry-pick clean commits or reconstruct scoped patches/hunks from mixed commits. Preserve authorship when reusing whole commits.

## Plan and authorization

Present the resolved source/base, target remote, ordered PR scopes, branch names, and material tradeoffs. Honor "plan only" or "先别动" by stopping at the plan.

For a creation request, local construction and validation in an isolated worktree can make the plan concrete before publication. Obtain approval for the concrete split before pushing/opening PRs unless the user already authorized that split or delegated those decisions. Interpret consent in context, without fixed approval keywords or repeated gates.

Recheck source/base SHAs before construction and publication. If they changed, inspect the delta and refresh the affected layers and validation. Ask again only when the change materially alters the approved split.

## Build and validate

```bash
STACK_WORKTREE=$(mktemp -d)
git worktree add --detach "$STACK_WORKTREE" "<BASE_SHA>"
```

Build PR 1 from the base, PR 2 from PR 1, and so on, using fresh branches and no merge commits. Inspect each layer's parent-to-head diff.

Resolve mechanical conflicts that preserve the source intent; pause for conflicts requiring a substantive new decision. On an interruption, report the worktree, completed layers, unresolved files, and any remote side effects so construction can resume.

Validate the planned checks per layer. Verify the aggregate stack preserves the intended source patch, including merge-resolution edits; account explicitly for adaptations required by a newer base. A compiling top layer alone does not prove that intermediate layers are usable.

When collaboration tools are available, independent layer reviews or checks can run in parallel against fixed layer SHAs in separate worktrees. Keep dependent layer construction and publication ordered, and revalidate affected results if a layer changes.

Fix construction-related failures before publishing. For unrelated or unavailable validation, state the limitation and proceed only within the user's accepted constraints.

## Publish and hand off

Derive the target repository from the remote URL, not an ambiguous `gh` default. Push validated branches normally, then create PRs in order:

```bash
git push "<TARGET_REMOTE>" "<STACK_BRANCH>"
gh pr create --repo "<OWNER/REPO>" --base "<PARENT_BRANCH>" \
  --head "<STACK_BRANCH>" --title "<TITLE>" --body-file "<PR_BODY_FILE>"
```

Follow the repository template. Each body describes that layer's behavior and validation, with its position and previous/next PR links. Default to ready for review unless the user requests draft or known limitations warrant it. Backfill links after creation; if this fails, report it without deleting or recreating PRs.

Return PR URLs in review/merge order, validation limits, and the retained source PR URL if any. Open PR pages only when requested.
