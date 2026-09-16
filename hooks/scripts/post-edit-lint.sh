#!/usr/bin/env bash
set -euo pipefail

input="$(cat)"
file_path="$(echo "$input" | jq -r '.tool_input.file_path // empty')"

[[ "$file_path" == *course-api/* ]] || exit 0
[[ "$file_path" == *.js ]] || exit 0

cd "${CLAUDE_PROJECT_DIR}/course-api"
if ! npm run lint --silent; then
  echo "course-api lint failed after edit to $file_path" >&2
  exit 2
fi
