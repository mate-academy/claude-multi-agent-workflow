#!/usr/bin/env bash
# PostToolUse hook: lints a JS file just written/edited by Claude Code, if it
# belongs to a project with an eslint config and a `lint` script. Reads the
# hook event JSON from stdin and never fails the tool call on lint findings.
set -euo pipefail

file_path="$(node -e '
  const data = JSON.parse(require("fs").readFileSync(0, "utf8"));
  process.stdout.write((data.tool_input && data.tool_input.file_path) || "");
')"

if [[ -z "$file_path" || "$file_path" != *.js ]]; then
  exit 0
fi

dir="$(dirname "$file_path")"
project_root=""
while [[ "$dir" != "/" && "$dir" != "." ]]; do
  if [[ -f "$dir/package.json" ]]; then
    project_root="$dir"
    break
  fi
  dir="$(dirname "$dir")"
done

if [[ -z "$project_root" ]]; then
  exit 0
fi

if ! grep -q '"lint"' "$project_root/package.json" 2>/dev/null; then
  exit 0
fi

(cd "$project_root" && npx --no-install eslint "$file_path" 2>&1) || true
exit 0
