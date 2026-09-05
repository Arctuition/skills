---
name: signoff
description: Commit the work just completed, push it, create or update its GitHub PR, and open the PR in the default browser. Use for "signoff", "ship it", "commit and PR", or "open a PR for this".
---

# Signoff

Deliver the task's change as a reviewable PR. The request authorizes committing, pushing, and opening the PR; use existing session context to identify its scope.

## Resolve scope and base

```bash
git status --short
git diff
git diff --cached
git remote -v
git branch --show-current
gh auth status
```

The base repository is `upstream` when present, otherwise `origin`. Resolve and fetch its current default branch, unless the user specified another base:

```bash
gh repo view "<BASE_OWNER/REPO>" --json defaultBranchRef --jq .defaultBranchRef.name
git fetch "<BASE_REMOTE>"
```

Check the complete branch diff against that base, including prior commits. Reuse a feature branch only when its changes belong to this task. From a default branch, detached HEAD, or unrelated branch, create an appropriately named task branch; use an isolated worktree if needed to preserve unrelated work.

Bring the task branch onto the current base with a method appropriate to its published history. Resolve mechanical conflicts within scope; do not rewrite shared history or alter unrelated edits. Run the repository's required checks and validation appropriate to the change.

## Commit only task-owned changes

Explicit paths alone do not isolate the index: plain `git commit` also includes previously staged files. Do not unstage someone else's work to make the index clean.

When each selected file is wholly task-owned, stage those paths and use a path-scoped commit:

```bash
git add -- "<TASK_FILE_1>" "<TASK_FILE_2>"
git diff --cached -- "<TASK_FILE_1>" "<TASK_FILE_2>"
git -c commit.gpgsign=false commit --only -m "<SUMMARY>" -- "<TASK_FILE_1>" "<TASK_FILE_2>"
```

`--only` uses the working-tree contents of those paths. If a selected file mixes task and unrelated hunks, isolate the task patch in a separate index or worktree instead; do not commit the whole file.

Use one concise unsigned commit, without a body, Co-Authored-By trailer, or AI attribution unless requested. Inspect the resulting commit and remaining worktree/index before pushing.

## Push and publish

Push to `origin` in the fork workflow; the PR still targets the resolved base repository. Verify the push target rather than assuming the branch's existing tracking remote.

```bash
git push -u origin "<TASK_BRANCH>"
gh pr create --repo "<BASE_OWNER/REPO>" --base "<BASE_BRANCH>" \
  --head "<HEAD_OWNER>:<TASK_BRANCH>" --title "<TITLE>" --body-file "<PR_BODY_FILE>"
```

Check for an existing PR before creating one; update that PR if it is the same task. Follow the repository's PR template when present. Describe the resulting behavior, relevant validation, and any material limitation. Default to ready for review unless the user requests draft.

Open the resulting URL in the operating system's default browser, using `open "<PR_URL>"` on macOS or the platform equivalent. Return the PR link and validation status; do not imply pending CI has passed.
