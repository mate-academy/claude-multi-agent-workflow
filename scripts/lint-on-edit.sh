#!/bin/bash
# PostToolUse hook: lint an edited JS file with the project's ESLint. Never blocks.
file=$(cat | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"\(.*\)"/\1/')
case "$file" in
  *.js) ;;
  *) exit 0 ;;
esac
dir=$(dirname "$file")
while [ "$dir" != "/" ] && [ ! -f "$dir/eslint.config.js" ]; do dir=$(dirname "$dir"); done
[ -f "$dir/eslint.config.js" ] || exit 0
cd "$dir" && npx --no-install eslint "$file" >&2 || true
exit 0
