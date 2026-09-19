#!/usr/bin/env bash
# PostToolUse hook: after Edit/Write, if the touched file is a course-api route,
# remind Claude (via stderr + exit 2) to keep docs/api.md and tests in sync.
set -euo pipefail

input="$(cat)"

file_path="$(node -e '
let data = "";
process.stdin.on("data", (c) => (data += c));
process.stdin.on("end", () => {
  try {
    const parsed = JSON.parse(data);
    process.stdout.write(parsed.tool_input?.file_path || "");
  } catch {
    process.stdout.write("");
  }
});
' <<< "$input")"

if [[ "$file_path" == *course-api/routes/*.js ]]; then
  echo "Route file changed: $file_path — keep course-api/docs/api.md and the matching course-api/tests/*.test.js in sync with this change (see the manipulate-routes skill and test-writer agent)." >&2
  exit 2
fi

exit 0
