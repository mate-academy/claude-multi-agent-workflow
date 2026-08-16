#!/usr/bin/env bash
# PostToolUse hook: auto-fix lint issues on the file that was just written/edited.
# Must never block the edit, so every exit path below is 0.

set -u

input="$(cat)"
file_path="$(printf '%s' "$input" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    print("")
    sys.exit(0)
print(data.get("tool_input", {}).get("file_path", ""))
' 2>/dev/null)"

[ -z "$file_path" ] && exit 0
[ -f "$file_path" ] || exit 0

case "$file_path" in
  *.js) ;;
  *) exit 0 ;;
esac

abs_path="$(cd "$(dirname "$file_path")" && pwd)/$(basename "$file_path")"

dir="$(dirname "$abs_path")"
pkg_dir=""
while [ "$dir" != "/" ] && [ -n "$dir" ]; do
  if [ -f "$dir/package.json" ]; then
    pkg_dir="$dir"
    break
  fi
  dir="$(dirname "$dir")"
done

[ -z "$pkg_dir" ] && exit 0

command -v npx >/dev/null 2>&1 || exit 0

(cd "$pkg_dir" && npx --no-install eslint --fix "$abs_path" >/dev/null 2>&1)

exit 0
