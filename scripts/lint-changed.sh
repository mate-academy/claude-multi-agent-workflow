#!/usr/bin/env sh
# PostToolUse hook: lint the JavaScript file Claude just wrote or edited.
#
# Reads the hook payload on stdin, finds the nearest project root above the
# edited file (the directory holding eslint.config.js), and runs ESLint on that
# one file. Exits 2 with the ESLint output on stderr so Claude sees the problems
# it just introduced and can fix them in the same turn.
#
# Stays quiet — exit 0, no output — whenever it cannot help: a non-JS file, no
# ESLint config above it, or dependencies not installed yet.

set -u

payload=$(cat)

file=$(printf '%s' "$payload" | node -e '
  let raw = "";
  process.stdin.on("data", (c) => (raw += c));
  process.stdin.on("end", () => {
    try {
      const p = JSON.parse(raw).tool_input || {};
      process.stdout.write(p.file_path || "");
    } catch {
      process.stdout.write("");
    }
  });
' 2>/dev/null) || exit 0

# Only JavaScript files, and only ones that still exist.
case "$file" in
  *.js|*.mjs|*.cjs) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

# Walk up from the file looking for the project that owns it.
dir=$(CDPATH= cd -- "$(dirname -- "$file")" && pwd)
root=""
while [ "$dir" != "/" ]; do
  if [ -f "$dir/eslint.config.js" ]; then
    root="$dir"
    break
  fi
  dir=$(dirname -- "$dir")
done
[ -n "$root" ] || exit 0

# No dependencies installed means no linter to run — say nothing.
[ -x "$root/node_modules/.bin/eslint" ] || exit 0

output=$(CDPATH= cd -- "$root" && ./node_modules/.bin/eslint --no-error-on-unmatched-pattern "$file" 2>&1) || {
  printf 'ESLint found problems in %s:\n\n%s\n' "$file" "$output" >&2
  exit 2
}

exit 0
