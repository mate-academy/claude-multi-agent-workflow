#!/usr/bin/env bash
# PostToolUse hook: lint a .js file under course-api/ right after Claude edits it.
# Feedback only: always exits 0 so it never blocks the edit.

input=$(cat)
file=$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.file_path||"")}catch(e){console.log("")}})')

case "$file" in
  *course-api/*.js) ;;
  *) exit 0 ;;
esac

dir="${file%%course-api/*}course-api"
[ -d "$dir/node_modules" ] || exit 0

(cd "$dir" && npx --no-install eslint "$file") >&2 || echo "lint-on-edit: eslint reported problems in $file" >&2
exit 0
