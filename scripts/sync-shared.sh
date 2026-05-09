#!/usr/bin/env bash
#
# sync-shared.sh — propagate the canonical design-tokens.md into each
# html-artifacts skill's references/ folder.
#
#   bash scripts/sync-shared.sh           # write: copy _shared into each skill
#   bash scripts/sync-shared.sh --check   # dry-run: exit 1 if any copy drifts
#
# Source of truth: skills/html-artifacts/_shared/design-tokens.md
# Targets:         skills/html-artifacts/<skill>/references/design-tokens.md
#                  (every directory under html-artifacts/ except _shared)
#
# Direct edits to the synced copies will be overwritten. To change the
# design system: edit _shared/design-tokens.md, then re-run this script.

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SHARED_DIR="$REPO/skills/html-artifacts/_shared"
SKILLS_DIR="$REPO/skills/html-artifacts"
SOURCE="$SHARED_DIR/design-tokens.md"

mode="write"
if [ "${1:-}" = "--check" ]; then
  mode="check"
elif [ -n "${1:-}" ]; then
  echo "usage: $0 [--check]" >&2
  exit 2
fi

if [ ! -f "$SOURCE" ]; then
  echo "error: source not found: $SOURCE" >&2
  exit 1
fi

drift=0
synced=0

for skill_dir in "$SKILLS_DIR"/*/; do
  skill_name="$(basename "$skill_dir")"
  # Skip the source folder itself.
  [ "$skill_name" = "_shared" ] && continue

  target="$skill_dir/references/design-tokens.md"

  if [ ! -d "$skill_dir/references" ]; then
    if [ "$mode" = "check" ]; then
      echo "missing: $target (references/ folder doesn't exist)" >&2
      drift=1
      continue
    fi
    mkdir -p "$skill_dir/references"
  fi

  if [ "$mode" = "check" ]; then
    if [ ! -f "$target" ] || ! cmp -s "$SOURCE" "$target"; then
      echo "drift: $target differs from _shared/design-tokens.md" >&2
      drift=1
    fi
  else
    cp "$SOURCE" "$target"
    synced=$((synced + 1))
    echo "synced  $target"
  fi
done

if [ "$mode" = "check" ]; then
  if [ "$drift" -ne 0 ]; then
    echo "" >&2
    echo "Run 'bash scripts/sync-shared.sh' to fix." >&2
    exit 1
  fi
  echo "all design-tokens.md copies match _shared/"
else
  echo ""
  echo "synced $synced skill(s)."
fi
