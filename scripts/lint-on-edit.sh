#!/usr/bin/env bash
# PostToolUse hook: lint an edited JS file with the nearest ESLint config.
# Reads the hook JSON on stdin. Exits 2 with lint output on stderr if lint fails,
# so Claude sees and fixes the problem.
file=$(sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
case "$file" in *.js) ;; *) exit 0 ;; esac
[ -f "$file" ] || exit 0

dir=$(dirname "$file")
while [ "$dir" != "/" ] && [ ! -f "$dir/eslint.config.js" ]; do dir=$(dirname "$dir"); done
[ -f "$dir/eslint.config.js" ] || exit 0
[ -x "$dir/node_modules/.bin/eslint" ] || exit 0

out=$(cd "$dir" && ./node_modules/.bin/eslint "$file" 2>&1) || { echo "$out" >&2; exit 2; }
exit 0
