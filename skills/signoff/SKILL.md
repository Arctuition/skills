---
name: signoff
description: Commit completed work, push, and create or update its GitHub PR. Use for "signoff", "ship it", "commit and PR", or "open a PR for this".
---

# Signoff

Deliver the current task as a reviewable PR. A signoff request authorizes committing, pushing, and creating or updating that PR; identify its scope from the session.

## Scope and base

- The base repository is `upstream` when present, otherwise `origin`. Refresh its default branch unless another base was requested, and bring the task branch onto that base without rewriting shared history.
- When the task builds on another open PR's branch, stack on it: use that branch as the base so the PR shows only this task's diff.
- Check staged, unstaged, and complete branch changes, including prior commits. Use a task branch whose diff belongs to this task; isolate it in a new branch or worktree when needed.
- Preserve unrelated worktree and index changes. A normal commit includes all staged entries; path-scoped commits take whole working-tree files. Isolate mixed-file hunks with a separate index or worktree.
- Inspect the resulting commit and remaining worktree/index before pushing.

## Delivery preferences

- Use one concise unsigned commit, without a body, Co-Authored-By trailer, or AI attribution unless requested.
- Push the task branch to the base repository itself, not to a fork, so the PR comes from a same-repository branch. Verify the push destination rather than relying on existing tracking settings, which may still point at a fork.
- Update an existing PR for the same task by pushing to its head branch. Follow the repository's PR template; default to ready for review unless draft is requested.
- Open the PR in the operating system's default browser. Return its link and validation status, clearly identifying pending CI.
