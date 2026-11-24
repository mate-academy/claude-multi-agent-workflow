#!/usr/bin/env bash
# quality-gate PostToolUse hook: run ESLint on the .js file Claude just wrote/edited.
# Finds the nearest folder with an ESLint config above the file, so it works in any
# project that installs the plugin. Exit 2 sends ESLint's output back to Claude.
file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write((j.tool_input&&j.tool_input.file_path)||"")}catch{}})')
case "$file" in *.js|*.cjs|*.mjs) ;; *) exit 0 ;; esac
[ -f "$file" ] || exit 0
dir=$(cd "$(dirname "$file")" && pwd)
file="$dir/$(basename "$file")"
while [ "$dir" != "/" ]; do
  for cfg in "$dir"/eslint.config.* "$dir"/.eslintrc*; do
    [ -e "$cfg" ] && break 2
  done
  dir=$(dirname "$dir")
done
[ "$dir" = "/" ] && exit 0
cd "$dir" || exit 0
if ! out=$(npx --no-install eslint "$file" 2>&1); then
  echo "ESLint failed on $file:" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
