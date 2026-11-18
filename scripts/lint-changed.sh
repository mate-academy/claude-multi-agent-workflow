#!/usr/bin/env bash
# PostToolUse hook: lint a JS file Claude just edited. Reads the hook JSON on stdin.
# Exit 2 with the lint output on stderr so Claude sees the problems and fixes them.
set -u

file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.file_path||"")}catch{}})')

case "$file" in
  *.js) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

# Find the nearest package.json upward; skip if eslint isn't installed there.
dir=$(dirname "$file")
while [ "$dir" != "/" ] && [ ! -f "$dir/package.json" ]; do dir=$(dirname "$dir"); done
[ -x "$dir/node_modules/.bin/eslint" ] || exit 0

if ! out=$(cd "$dir" && ./node_modules/.bin/eslint "$file" 2>&1); then
  echo "$out" >&2
  exit 2
fi
