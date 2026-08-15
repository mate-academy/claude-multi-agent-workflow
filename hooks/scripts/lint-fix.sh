#!/bin/bash
set -euo pipefail

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Only handle .js files inside a course-api/ tree
if [[ -z "$file_path" || "$file_path" != *.js || "$file_path" != *"/course-api/"* ]]; then
  exit 0
fi

api_root="${file_path%%/course-api/*}/course-api"
rel_path="${file_path#*/course-api/}"

if [[ ! -d "$api_root/node_modules" ]]; then
  echo '{"systemMessage": "Skipped eslint --fix: run npm install in course-api/ first."}'
  exit 0
fi

(cd "$api_root" && npx eslint --fix "$rel_path") 2>/dev/null || true
echo "{\"systemMessage\": \"Ran eslint --fix on course-api/$rel_path\"}"
exit 0
