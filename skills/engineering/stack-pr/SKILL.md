---
name: stack-pr
description: Analyze committed changes on the current local branch, propose a dependency-ordered stacked PR plan, then after explicit approval create multiple upstream stacked PRs. Use when the user asks to "stack this PR", "create a PR stack", "split this branch into PRs", "split PR", "拆 PR", "分开 signoff", or says a branch/PR is too big to review.
---

# Stack PR

Turn the committed changes on the current local branch into a set of true stacked GitHub PRs. The default flow is:

1. Analyze the current branch against a resolved base.
2. Present an execution plan.
3. Wait for explicit approval to mutate git.
4. Build local stack branches in a temporary worktree.
5. Validate locally.
6. Push branches to the target remote and open stacked PRs.

This skill only creates new stacks. It does not update, overwrite, retarget, close, or repair existing stack PRs.

## Hard rules

- Respond to the user in the user's language. For ArcSite engineering repos, default branch names, commit messages, PR titles, and PR bodies to English unless the user asks otherwise.
- Use only committed changes from the current branch by default. Exclude staged, unstaged, and untracked files unless the user explicitly changes scope.
- Never rewrite, rebase, reset, delete, force-push, or otherwise modify the original source branch.
- Prefer a temporary `git worktree` for stack construction so the user's checkout remains on the source branch.
- Push stack branches to `upstream` when it exists; otherwise use `origin`.
- Do not use merge commits while constructing the stack.
- Do not open PRs until every local stack branch is built and the planned local validation has passed, or the user explicitly accepts a validation failure.
- Do not open PR pages in the browser unless the user asks.
- Do not create Jira tickets, GitHub issues, or project-board items unless explicitly asked.

## Modes

### Create mode

This is the only supported execution mode. Analyze the current branch and create a new stack after explicit approval.

### Plan-only mode

If the user says "只规划", "先别动", "don't create PRs", or similar, stop after the plan.

### Existing stacks

Do not update existing stack branches or PRs. If an inferred branch name already exists locally or on the target remote, generate a new non-conflicting stack prefix, usually by suffixing the inferred prefix with `-v2`, `-v3`, etc. Show both the originally inferred prefix and the final prefix in the plan.

## 1) Preflight and base resolution

Start from the current checkout.

```bash
git status --short
git branch --show-current
git remote -v
gh auth status
```

Fetch before resolving the base:

```bash
if git remote get-url upstream >/dev/null 2>&1; then
  git fetch upstream --prune
else
  git fetch origin --prune
fi
```

If the current branch already has an open PR, read its title, body, and base as intent metadata. Do not edit, close, retarget, or replace that source PR automatically. After creating the stack, report the original PR URL and leave it unchanged.

Resolve the base in this order:

1. User-specified base.
2. Current branch's open PR base, if one exists and the user did not specify a base.
3. `upstream/<default-branch>` when `upstream` exists.
4. `origin/<default-branch>`.
5. `master`, then `main`, only if remote default resolution fails.

Derive remote default branches from GitHub or remote refs; do not hard-code `master` or `main`.

```bash
git remote get-url upstream
git remote get-url origin
gh repo view <OWNER/REPO> --json defaultBranchRef --jq .defaultBranchRef.name
git symbolic-ref refs/remotes/origin/HEAD
```

Record the resolved base ref and SHA. Before execution, re-check the base SHA. If it changed since planning, stop and refresh the plan unless the user explicitly accepts proceeding.

## 2) Source scope and diff semantics

Default source scope is committed changes on the current branch.

If the worktree is dirty, analysis may continue using committed diff only, but report that uncommitted changes are excluded. Execution must stop while the worktree is dirty unless the user explicitly says how to handle it. Never auto-stash, auto-commit, auto-reset, or auto-clean.

Use two-dot and merge-base diffs for different purposes:

```bash
git log --oneline <base>..HEAD
MERGE_BASE=$(git merge-base <base> HEAD)
git diff --stat "$MERGE_BASE"..HEAD
git diff --name-only "$MERGE_BASE"..HEAD
git diff "$MERGE_BASE"..HEAD
```

Use `git log <base>..HEAD` for commits reachable from the source branch but not from base. Use `git diff "$MERGE_BASE"..HEAD` for the actual patch introduced by the branch. Do not use `git diff <base>..HEAD` as the source patch if the branch is behind or diverged from base.

If there are no commits and no committed diff, stop. If the worktree has uncommitted changes, ask the user to commit them first.

List merge commits during analysis, but do not copy merge commits into the stack by default. Ignore pure sync merges. If conflict-resolution edits in a merge commit affect the feature, preserve the resulting file changes in the appropriate reconstructed commit.

## 3) Inventory the change

Read the changed files in full enough context to understand each file's role. Do not split from filenames alone.

Use the commit history as a hint, not the answer:

```bash
git log --oneline --decorate <base>..HEAD
git diff --name-status "$MERGE_BASE"..HEAD
git diff --stat "$MERGE_BASE"..HEAD
```

Cluster changes by the dimension that produces clean, independently reviewable stack layers:

- Feature surface: h5, web, server, shared package, tooling.
- Dependency layer: shared types/utilities, primitives, service wiring, UI wiring, user-visible flip.
- Risk: pure refactor, additive feature, feature flag, visible behavior.
- Commit intent: extract, introduce, wire, polish.

ArcSite defaults:

- Keep pre-existing-code refactors out of feature PRs. Put refactors in an earlier PR when they are needed.
- For Jinja2 to BlockNote widget migration rounds, do not split per widget by default. Flag the pattern and ask before splitting anyway.
- Split genuinely oversized work aggressively, but keep indivisible changes together.

Sizing target: keep each PR under roughly 400 net lines when practical. Larger PRs are allowed only when the scope is genuinely indivisible; state why splitting further would make the stack less reviewable or less mergeable.

## 4) Infer names

Infer a short stack prefix from the overall change intent using PR metadata if available, commit messages, changed files, symbols, Jira keys, and user constraints. Prefer including a clear Jira key. Use the current branch name only as a fallback.

Infer each PR slug from that PR's proposed scope. Do not derive PR titles or slugs from the source branch except as a fallback.

Format:

```text
<stack-prefix>/NN-<content-derived-slug>
```

Example:

```text
arc-3510-blocknote-import/01-field-data-schema
arc-3510-blocknote-import/02-pdf-import-adapter
arc-3510-blocknote-import/03-editor-wiring
```

Check local and target remote branch names before execution. If there is a collision, select a new non-conflicting prefix such as `arc-3510-blocknote-import-v2` and show it in the plan. Never delete, overwrite, or force-push existing branches.

## 5) Choose extraction strategy

For each planned PR, state how to carve it from the source branch:

1. Cherry-pick whole commits when commit boundaries match the PR scope.
2. If commits are mixed, create fresh branches and apply scoped patches or file subsets.
3. If a file contains changes for multiple PRs, split hunks manually.
4. If the plan proves impossible during reconstruction, stop and present a revised plan.

Commit construction:

- Preserve whole original commits only when they are already cleanly scoped.
- Squash or reconstruct noisy/WIP commits into clear semantic commits for each stack branch.
- Prefer one commit per PR when the PR scope is narrow and cohesive.
- Use multiple commits in one PR only when they represent distinct reviewable steps.
- Preserve original authorship when cherry-picking whole commits.
- Add the repo's standard co-author trailer only to reconstructed commits created by the agent, when applicable.

Allowed edits during execution:

- Apply only the source-branch changes needed for the approved PR scope.
- Hunk-split mixed files.
- Resolve mechanical conflicts caused by stacking order.

Not allowed:

- New behavior beyond the approved plan.
- Opportunistic refactors.
- Test rewrites unrelated to the split.
- Formatting churn outside touched hunks.

## 6) Present the plan

Before any branch, commit, push, or PR creation, present the plan and wait for explicit execution approval.

Plan output:

```md
## Stack plan: <feature name>

Base: <resolved base ref> (<sha>)
Target remote/repo: <TARGET_REMOTE> / <OWNER/REPO>
Source branch: <branch name> (left unchanged)
Dirty worktree: <clean / dirty, excluded from source>
Inferred prefix: <original>
Final prefix: <non-conflicting prefix>
PR readiness: <ready for review / draft with reason>

### PR 1 - <title>
Branch: <prefix>/01-...
Base: <resolved base branch>
Scope: <one sentence>
Files: <key paths, can elide with "+N more">
Commits: <oids or "reconstructed from mixed commits">
Extraction: <cherry-pick / file-level patch / hunk-level patch / manual reconstruction>
Validation: <targeted command(s)>
Risk: low / medium / high - <reason>

### PR 2 - <title>
Branch: <prefix>/02-...
Base: <prefix>/01-...
...

What this optimizes for: <one sentence>
What it costs: <one sentence>
Open question: <one concrete question, or "none">

Reply `执行` / `create stack` to create these upstream branches and PRs. Plain `ok` / `可以` means the plan is accepted but git will not be mutated.
```

Treat "ok", "可以", "looks good", and similar as plan approval only. Proceed to mutation only on explicit execution language such as "执行", "create stack", "open the PRs", or "go ahead and create them".

## 7) Build the stack locally

After explicit approval, re-check:

```bash
git status --short
git rev-parse <base>
```

Stop if the worktree is dirty or the base SHA changed unexpectedly.

Create a temporary worktree from the resolved base:

```bash
WORKTREE_DIR=$(mktemp -d /tmp/stack-pr-XXXXXX)
git worktree add "$WORKTREE_DIR" <base>
```

Build stack branches linearly:

- PR 1 branch starts at the resolved base.
- PR 2 branch starts at PR 1 branch.
- PR N branch starts at PR N-1 branch.

Do not merge while constructing the stack. Use cherry-pick, scoped patch application, or manual hunk reconstruction according to the approved plan.

Before moving to the next layer, inspect the layer diff:

```bash
git diff --stat <parent-branch-or-base>..<head-branch>
git diff --name-only <parent-branch-or-base>..<head-branch>
```

If extraction, cherry-pick, or patch application conflicts, stop at the first conflict. Report the layer, temporary worktree path, conflicting files, failed command, already-created local branches, and whether anything remote was created. Do not continue to later branches.

## 8) Validate before push

Run the planned targeted validation for each branch where practical. Prefer focused checks over full suites.

If any validation fails, stop before pushing/opening PRs. Summarize the failure and whether it appears related. Continue only if the user explicitly approves proceeding despite the failure. Record any user-approved validation exception in the PR body test plan.

## 9) Push and create PRs

Only after all local branches are built and validation is acceptable:

1. Push all stack branches to the target remote, normally `upstream`.
2. Create PRs in order.
3. Use true stacked bases:
   - PR 1 base = resolved base branch.
   - PR N base = previous stack branch.

Derive the target repo from the target remote URL. Do not rely on `gh` defaults when a repo can be ambiguous.

```bash
git push <TARGET_REMOTE> <branch-name>
gh pr create --repo <OWNER/REPO> --base <base-branch> --head <branch-name> --title "<title>" --body "<body>"
```

Default PR readiness is ready for review. Create draft PRs only if the user asks, validation is materially incomplete, a PR has known unresolved follow-up before review, or the repo clearly prefers draft stacked PRs.

## 10) PR body rules

Follow the repo's PR template when present:

- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/pull_request_template.md`
- files under `.github/PULL_REQUEST_TEMPLATE/`

Fill every applicable section with real content. Do not leave placeholder prompts.

Each PR body should describe only that PR's scope, not the whole stack in full detail. Include stack context near the top:

```md
Stack: <N>/<total>
Base: <base branch>
Previous: <previous PR URL or ->
Next: <next PR URL or pending>

This PR only contains: <one sentence>
```

Fallback body when there is no template:

```md
## Summary
- ...

## Stack
- Position: <N>/<total>
- Base: <base branch>
- Previous: <previous PR URL or ->
- Next: <next PR URL or pending>

## Test Plan
- ...
```

After all PRs are created, best-effort update PR bodies with previous/next/full-stack links using `gh pr edit`. If link backfill fails, report it and leave the PRs open. Do not delete or recreate PRs just to fix links.

## 11) Final output

After execution, output:

```md
## Stack created

Review/merge order:
1. <PR URL> - <title> (`<branch>`)
2. <PR URL> - <title> (`<branch>`)

Validation:
- <branch>: <command> - <result>

Notes:
- Source branch `<source>` left unchanged.
- <Any skipped validation or best-effort body-link failures.>
```

Do not include a long recap. The PR URLs and merge order are the handoff.
