#!/usr/bin/env bash
# PostToolUse hook: after Claude edits or writes a .js file, run ESLint on
# it (if the project has one configured) and surface the result as context,
# instead of waiting for a manual review or the next /audit run to catch it.
set -euo pipefail

input="$(cat)"

file_path="$(node -e '
let data = "";
process.stdin.on("data", (c) => (data += c));
process.stdin.on("end", () => {
  try {
    const j = JSON.parse(data);
    process.stdout.write((j.tool_input && j.tool_input.file_path) || "");
  } catch {
    // no-op: malformed input just yields no file_path
  }
});
' <<<"$input")"

[ -z "$file_path" ] && exit 0
[ -f "$file_path" ] || exit 0
case "$file_path" in
  *.js) ;;
  *) exit 0 ;;
esac

dir="$(dirname "$file_path")"
project_dir=""
while [ "$dir" != "/" ] && [ -n "$dir" ]; do
  if [ -f "$dir/package.json" ] && ls "$dir"/eslint.config.* >/dev/null 2>&1; then
    project_dir="$dir"
    break
  fi
  dir="$(dirname "$dir")"
done

# No ESLint config found for this file's project — nothing to run.
[ -z "$project_dir" ] && exit 0

output="$(cd "$project_dir" && npx --no-install eslint "$file_path" --no-color 2>&1)" || true

if [ -n "$output" ]; then
  echo "ESLint findings for $file_path:"
  echo "$output"
fi
