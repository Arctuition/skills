#!/usr/bin/env bash
set -euo pipefail

# Copies all skills in the repository into ~/.agents/skills.
# Unlike a symlink-based installer, this writes real files so the
# destination keeps working even if this repo is moved or deleted.
#
# Merge semantics: existing files at the destination are overwritten,
# but files that were deleted from the source are NOT removed from the
# destination. If you want a clean mirror, rm -rf ~/.agents/skills first.

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HOME/.agents/skills"

# If ~/.agents/skills is a symlink that resolves into this repo, cp -R
# would follow it and write copies back into the working tree. Detect
# and bail out instead of polluting the repo.
if [ -L "$DEST" ]; then
  resolved="$(readlink -f "$DEST")"
  case "$resolved" in
    "$REPO"|"$REPO"/*)
      echo "error: $DEST is a symlink into this repo ($resolved)." >&2
      echo "Remove it (rm \"$DEST\") and re-run; the script will recreate it as a real dir." >&2
      exit 1
      ;;
  esac
fi

mkdir -p "$DEST"

find "$REPO/skills" -name SKILL.md -not -path '*/node_modules/*' -not -path '*/deprecated/*' -print0 |
while IFS= read -r -d '' skill_md; do
  src="$(dirname "$skill_md")"
  name="$(basename "$src")"
  target="$DEST/$name"

  # If a symlink is sitting where the skill dir should be, remove it so
  # cp -R doesn't follow it and write outside ~/.agents/skills.
  if [ -L "$target" ]; then
    rm -f "$target"
  fi

  mkdir -p "$target"
  cp -R "$src/." "$target/"
  echo "copied $name -> $target"
done
