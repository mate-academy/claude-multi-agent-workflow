#!/usr/bin/env bash
# PreToolUse hook for the Bash tool: blocks `git commit` until /ship has been run.
input="$(cat)"

if echo "$input" | grep -qE '"command"[[:space:]]*:[[:space:]]*"[^"]*git commit'; then
  echo "This looks like a git commit. Run /ship first so code-reviewer and test-writer can check the change before it's committed." >&2
  exit 2
fi

exit 0
