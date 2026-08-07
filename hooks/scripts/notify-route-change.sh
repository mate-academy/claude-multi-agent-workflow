#!/usr/bin/env bash
set -euo pipefail

input="$(cat)"
file_path="$(printf '%s' "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*:[[:space:]]*"(.*)"/\1/')"

if [[ "$file_path" == *course-api/routes/* || "$file_path" == *course-api/db/* ]]; then
  echo "api-quality-guard: \"$file_path\" changed — run /guard to review it and update tests before you commit." >&2
fi

exit 0
