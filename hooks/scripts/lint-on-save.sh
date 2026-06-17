#!/usr/bin/env bash
# PostToolUse hook: after a file is written or edited, lint it if it's a JS file
# inside course-api/. Advisory only — never blocks the edit, just surfaces problems.
set -euo pipefail

# The hook receives the tool-call payload as JSON on stdin.
payload="$(cat)"

# Pull the edited file path out of the payload without a hard jq dependency.
file_path="$(printf '%s' "$payload" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"//;s/"$//')"

# Nothing to do if we couldn't find a path or it isn't a JS file.
case "$file_path" in
  *.js) ;;
  *) exit 0 ;;
esac

# Only lint files that belong to the course-api project.
case "$file_path" in
  *course-api/*) ;;
  *) exit 0 ;;
esac

api_dir="${file_path%%course-api/*}course-api"
[ -d "$api_dir/node_modules" ] || exit 0   # deps not installed; skip quietly

# Run from inside the project so ESLint v9 finds its flat config (eslint.config.js).
if ! ( cd "$api_dir" && npx eslint "$file_path" ) >/tmp/lint-on-save.out 2>&1; then
  echo "lint-on-save: ESLint flagged $file_path" >&2
  cat /tmp/lint-on-save.out >&2
  exit 2   # non-zero, non-blocking exit code surfaces output to the assistant
fi

exit 0
