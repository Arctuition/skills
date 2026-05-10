#!/usr/bin/env bash
#
# sync-shared.sh — propagate shared content from _shared/ into each
# html-artifacts skill.
#
#   bash scripts/sync-shared.sh           # write: copy _shared into each skill
#   bash scripts/sync-shared.sh --check   # dry-run: exit 1 if any copy drifts
#
# Two kinds of sync:
#
# 1. File-level (design-tokens.md):
#    Source: skills/html-artifacts/_shared/design-tokens.md
#    Target: skills/html-artifacts/<skill>/references/design-tokens.md
#
# 2. Block-level (everything else in _shared/*.md):
#    Source: skills/html-artifacts/_shared/<name>.md
#    Target: any region in skills/html-artifacts/<skill>/SKILL.md wrapped by
#               <!-- shared:<name>-start -->
#               ...
#               <!-- shared:<name>-end -->
#    Skills opt in by adding the marker pair. Skills without the markers are
#    untouched.
#
# To change the shared content: edit the file in _shared/, then re-run this
# script. Direct edits to the synced copies/blocks will be overwritten.

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SHARED_DIR="$REPO/skills/html-artifacts/_shared"
SKILLS_DIR="$REPO/skills/html-artifacts"

mode="write"
if [ "${1:-}" = "--check" ]; then
  mode="check"
elif [ -n "${1:-}" ]; then
  echo "usage: $0 [--check]" >&2
  exit 2
fi

drift=0
synced=0

# ---- 1. File-level: design-tokens.md ----------------------------------------

SOURCE="$SHARED_DIR/design-tokens.md"
if [ ! -f "$SOURCE" ]; then
  echo "error: source not found: $SOURCE" >&2
  exit 1
fi

for skill_dir in "$SKILLS_DIR"/*/; do
  skill_name="$(basename "$skill_dir")"
  [ "$skill_name" = "_shared" ] && continue

  target="${skill_dir}references/design-tokens.md"

  if [ ! -d "${skill_dir}references" ]; then
    if [ "$mode" = "check" ]; then
      echo "missing: $target (references/ folder doesn't exist)" >&2
      drift=1
      continue
    fi
    mkdir -p "${skill_dir}references"
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

# ---- 2. Block-level: every other _shared/*.md -------------------------------

for block_file in "$SHARED_DIR"/*.md; do
  block_name="$(basename "${block_file%.md}")"
  [ "$block_name" = "design-tokens" ] && continue

  for skill_dir in "$SKILLS_DIR"/*/; do
    skill_name="$(basename "$skill_dir")"
    [ "$skill_name" = "_shared" ] && continue

    target="${skill_dir}SKILL.md"
    [ -f "$target" ] || continue

    # Skip silently if this SKILL.md doesn't opt in to this block.
    start_marker="<!-- shared:${block_name}-start -->"
    end_marker="<!-- shared:${block_name}-end -->"
    if ! grep -qF "$start_marker" "$target"; then
      continue
    fi
    if ! grep -qF "$end_marker" "$target"; then
      echo "error: $target has $start_marker but no $end_marker" >&2
      drift=1
      continue
    fi

    tmp="$(mktemp)"
    awk -v start="$start_marker" -v end="$end_marker" -v bf="$block_file" '
      $0 == start {
        print
        while ((getline line < bf) > 0) print line
        close(bf)
        in_block = 1
        next
      }
      $0 == end {
        in_block = 0
        print
        next
      }
      !in_block { print }
    ' "$target" > "$tmp"

    if [ "$mode" = "check" ]; then
      if ! cmp -s "$tmp" "$target"; then
        echo "drift: $target block '$block_name' differs from _shared/${block_name}.md" >&2
        drift=1
      fi
      rm "$tmp"
    else
      mv "$tmp" "$target"
      synced=$((synced + 1))
      echo "synced  $target (block: $block_name)"
    fi
  done
done

if [ "$mode" = "check" ]; then
  if [ "$drift" -ne 0 ]; then
    echo "" >&2
    echo "Run 'bash scripts/sync-shared.sh' to fix." >&2
    exit 1
  fi
  echo "all shared content in sync"
else
  echo ""
  echo "synced $synced item(s)."
fi
