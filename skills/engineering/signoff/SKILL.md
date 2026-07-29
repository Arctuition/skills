---
name: signoff
description: Wrap up the work you just did and open a PR for it — branch off main/master if needed, commit only the changes you made, push, open a pull request (following .github/PULL_REQUEST_TEMPLATE.md when present), and open the PR in the browser. Targets the `upstream` remote's default branch as the base when an `upstream` remote exists, otherwise `origin`. Use when the user says "sign off", "signoff", "ship it", "open a PR for this", "commit and PR", or "wrap this up".
---

# Sign Off

Take the change that's already in the working tree and get it onto a PR: branch → commit → push → PR → open in browser. The goal is a clean, reviewable pull request with zero collateral — nothing committed that you didn't write this session.

## Golden rule — commit only your own work

**Never `git add -A`, `git add .`, or `git commit -a`.** Stage every file explicitly by path. Files that were already staged or sitting untracked before you started are **not yours to commit** — leave them alone. If you can't tell whether a change is yours, ask before staging it. This rule overrides convenience every time.

## Workflow

### 1) Find the base repo and branch

```bash
git remote -v
```

- If an **`upstream`** remote exists, the PR targets it (fork workflow): base repo = `upstream`, base branch = its default branch. Find it with:
  ```bash
  gh repo view <upstream-owner/repo> --json defaultBranchRef --jq .defaultBranchRef.name
  ```
- If there is no `upstream`, the PR targets `origin` and its default branch.

### 2) Branch if needed

```bash
git branch --show-current
```

If you're on `main`, `master`, or the base branch, create a new branch with a short kebab-case name describing the change (`add-signoff-skill`, `fix-retry-backoff`). If you're already on a feature branch, reuse it.

```bash
git switch -c <descriptive-branch-name>
```

### 3) See exactly what changed and whose it is

```bash
git status --short
git diff            # unstaged
git diff --staged   # already staged — scrutinize: did YOU stage this?
```

Sort every entry into **yours** (created/edited this session) vs **pre-existing** (staged or untracked before you started). Only the first group is in scope. When in doubt, ask the user rather than guess.

### 4) Stage only your files, explicitly

```bash
git add path/to/file-you-changed another/file.md
```

Re-run `git status --short` and confirm the "Changes to be committed" list contains your files and nothing else.

### 5) Commit

Write a clear, imperative summary that matches the repo's existing log style.

```bash
git commit -m "<concise summary of the change>"
```

### 6) Push

```bash
git push -u origin <branch-name>
```

(Push to `origin` — your fork — even when the PR targets `upstream`.)

### 7) Open the PR

Check for a template first — `.github/PULL_REQUEST_TEMPLATE.md` (also `.github/pull_request_template.md` or templates under `.github/PULL_REQUEST_TEMPLATE/`). If one exists, **fill every section out** with real content; don't leave the placeholder prompts in.

Fork workflow (upstream exists):

```bash
gh pr create --repo <upstream-owner/repo> --base <default-branch> \
  --head <origin-owner>:<branch-name> \
  --title "<title>" --body "<body following the template if any>"
```

No upstream:

```bash
gh pr create --base <default-branch> --title "<title>" --body "<body>"
```

### 8) Open the PR in the browser

```bash
gh pr view --web        # current branch's PR
# or, with the URL gh printed:
open <pr-url>           # macOS
```

## Notes

- Pre-flight: confirm `gh auth status` is logged in before step 7.
- If the branch already has an open PR, `gh pr create` will say so — surface the existing URL and open it instead of erroring out.
- If CI checks or a base-branch protection rule block the PR, report it; don't try to bypass it.
