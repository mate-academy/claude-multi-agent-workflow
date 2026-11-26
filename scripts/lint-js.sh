#!/usr/bin/env bash
# PostToolUse hook: run ESLint on a .js file Claude just edited or wrote.
# Reads the hook JSON from stdin. Exit 2 sends lint errors back to Claude.

input=$(cat)

file=$(printf '%s' "$input" | node -e '
  let d = "";
  process.stdin.on("data", (c) => (d += c));
  process.stdin.on("end", () => {
    try { process.stdout.write(JSON.parse(d).tool_input.file_path || ""); }
    catch { /* not JSON: print nothing */ }
  });
')

# Only lint JavaScript files.
case "$file" in
  *.js) ;;
  *) exit 0 ;;
esac

# Find the nearest folder with an eslint config, starting from the file.
dir=$(dirname "$file")
while [ "$dir" != "/" ] && [ ! -f "$dir/eslint.config.js" ]; do
  dir=$(dirname "$dir")
done
[ -f "$dir/eslint.config.js" ] || exit 0

# Skip quietly if dependencies are not installed.
[ -x "$dir/node_modules/.bin/eslint" ] || exit 0

if ! out=$(cd "$dir" && ./node_modules/.bin/eslint "$file" 2>&1); then
  echo "ESLint found problems in $file:" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
