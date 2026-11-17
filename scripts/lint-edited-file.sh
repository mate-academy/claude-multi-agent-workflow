#!/usr/bin/env bash
# api-quality PostToolUse hook: after Claude edits or writes a JavaScript
# file, run the project's own ESLint on that file with --fix. If problems
# remain, exit 2 so the lint output is fed back to Claude to fix.
#
# The plugin can be installed into any repo, so the script finds ESLint
# itself. It walks up from the edited file to the nearest folder with an
# eslint config and a local eslint install. If there isn't one, it does
# nothing (exit 0), so projects without ESLint are never blocked.

set -u

# The tool call arrives as JSON on stdin. Read file_path with Node, which
# any project with ESLint already has.
file_path=$(node -e '
  let s = "";
  process.stdin.on("data", (d) => (s += d)).on("end", () => {
    try {
      const input = JSON.parse(s);
      process.stdout.write((input.tool_input && input.tool_input.file_path) || "");
    } catch {
      process.stdout.write("");
    }
  });
' 2>/dev/null) || exit 0
[ -n "$file_path" ] || exit 0

# A relative file_path is relative to the hook's working directory. Make it
# absolute now, because we cd into the ESLint root before running ESLint.
case "$file_path" in
  /*) ;;
  *) file_path="$(pwd)/$file_path" ;;
esac

case "$file_path" in
  *.js|*.cjs|*.mjs) ;;
  *) exit 0 ;;
esac
case "$file_path" in
  */node_modules/*) exit 0 ;;
esac
[ -f "$file_path" ] || exit 0

# Walk up to the nearest folder with both an ESLint config and a local eslint.
dir=$(cd "$(dirname "$file_path")" && pwd)
eslint_root=""
has_eslint_config() {
  for candidate in "$1"/eslint.config.* "$1"/.eslintrc*; do
    [ -e "$candidate" ] && return 0
  done
  return 1
}
while [ -n "$dir" ] && [ "$dir" != "/" ]; do
  if has_eslint_config "$dir" && [ -x "$dir/node_modules/.bin/eslint" ]; then
    eslint_root="$dir"
    break
  fi
  dir=$(dirname "$dir")
done
[ -n "$eslint_root" ] || exit 0

cd "$eslint_root" || exit 0
if ! output=$(./node_modules/.bin/eslint --fix "$file_path" 2>&1); then
  echo "ESLint found problems in $file_path that --fix could not resolve:" >&2
  echo "$output" >&2
  exit 2
fi
exit 0
