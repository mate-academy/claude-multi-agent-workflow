#!/usr/bin/env bash
# course-quality plugin — PostToolUse hook.
# After Claude writes or edits a file, if that file lives inside a course-api
# project, lint just that file with the project's ESLint. Advisory only: the
# result is printed for context and the hook always exits 0 so it never blocks
# the edit.

set -uo pipefail

# The hook payload arrives as JSON on stdin; pull out the edited file path.
payload="$(cat)"
file_path="$(printf '%s' "$payload" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"

[ -z "$file_path" ] && exit 0

# Only act on JS files under a course-api directory.
case "$file_path" in
  *course-api/*.js) ;;
  *) exit 0 ;;
esac

# Walk up from the file to find the course-api root (the one with package.json).
dir="$(dirname "$file_path")"
while [ "$dir" != "/" ] && [ "$(basename "$dir")" != "course-api" ]; do
  dir="$(dirname "$dir")"
done
[ -f "$dir/package.json" ] || exit 0

if [ -x "$dir/node_modules/.bin/eslint" ]; then
  echo "course-quality: linting $(basename "$file_path")"
  (cd "$dir" && ./node_modules/.bin/eslint "$file_path") || true
fi

exit 0
