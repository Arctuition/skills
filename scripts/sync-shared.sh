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
# 1. File-level (base tokens and component references):
#    Source: skills/html-artifacts/_shared/design-tokens.md
#    Target: skills/html-artifacts/<skill>/references/design-tokens.md
#    Source: skills/html-artifacts/_shared/components/*.md
#    Target: skills/html-artifacts/<skill>/references/components/*.md
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

# ---- 1. File-level: base tokens and component references -------------------

SOURCE="$SHARED_DIR/design-tokens.md"
if [ ! -f "$SOURCE" ]; then
  echo "error: source not found: $SOURCE" >&2
  exit 1
fi

for SOURCE in "$SHARED_DIR/design-tokens.md" "$SHARED_DIR"/components/*.md; do
  [ -f "$SOURCE" ] || continue
  for skill_dir in "$SKILLS_DIR"/*/; do
    skill_name="$(basename "$skill_dir")"
    [ "$skill_name" = "_shared" ] && continue
    [ -f "${skill_dir}SKILL.md" ] || continue

    reference_name="$(basename "$SOURCE")"
    if [ "$(dirname "$SOURCE")" = "$SHARED_DIR/components" ]; then
      reference_name="components/$reference_name"
    fi
    target="${skill_dir}references/$reference_name"

    if [ ! -d "$(dirname "$target")" ]; then
      if [ "$mode" = "check" ]; then
        echo "missing: $target (reference folder doesn't exist)" >&2
        drift=1
        continue
      fi
      mkdir -p "$(dirname "$target")"
    fi

    if [ "$mode" = "check" ]; then
      if [ ! -f "$target" ] || ! cmp -s "$SOURCE" "$target"; then
        echo "drift: $target differs from $SOURCE" >&2
        drift=1
      fi
    else
      cp "$SOURCE" "$target"
      synced=$((synced + 1))
      echo "synced  $target"
    fi
  done
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
    if ! grep -qF "$start_marker" "$target" && ! grep -qF "$end_marker" "$target"; then
      continue
    fi
    if ! grep -qF "$start_marker" "$target" || ! grep -qF "$end_marker" "$target"; then
      echo "error: $target has an unmatched marker for $block_name" >&2
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

if [ "$drift" -ne 0 ]; then
  echo "shared content is incomplete or invalid; inspect the errors above before syncing." >&2
  exit 1
fi

if [ "$mode" = "check" ]; then
  echo "all shared content in sync"
else
  echo ""
  echo "synced $synced item(s)."
fi
