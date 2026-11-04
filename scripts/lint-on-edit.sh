#!/bin/sh
# PostToolUse hook: lint an edited .js file with the nearest eslint config.
# Exit 2 (stderr shown to Claude) on lint errors; otherwise exit 0.
file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.file_path||"")}catch(e){}})')
case "$file" in *.js) ;; *) exit 0 ;; esac
[ -f "$file" ] || exit 0
dir=$(dirname "$file")
while [ "$dir" != "/" ] && [ ! -f "$dir/eslint.config.js" ]; do dir=$(dirname "$dir"); done
[ -f "$dir/eslint.config.js" ] && [ -d "$dir/node_modules" ] || exit 0
out=$(cd "$dir" && npx --no-install eslint "$file" 2>&1) || { echo "$out" >&2; exit 2; }
exit 0
