#!/usr/bin/env bash
# PreToolUse guard: exit 2 blocks the tool call and sends stderr back to Claude.
set -euo pipefail

input="$(cat)"

# Read tool_input.file_path (or notebook_path) from the hook payload.
if command -v jq >/dev/null 2>&1; then
  path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')"
else
  path="$(printf '%s' "$input" | python3 -c 'import sys,json; t=json.load(sys.stdin).get("tool_input",{}); print(t.get("file_path") or t.get("notebook_path") or "")')"
fi

[ -z "$path" ] && exit 0

name="$(basename "$path")"

# Templates are allowed.
case "$name" in
  .env.example|.env.sample|.env.template) exit 0 ;;
esac

reason=""
case "$name" in
  .env|.env.*)                                    reason="environment/secrets file" ;;
  *.pem|*.key|*.p12|*.pfx|id_rsa*|id_ed25519*)    reason="private key or certificate" ;;
  credentials.json|secrets.*|*.secret)            reason="credentials file" ;;
  package-lock.json|yarn.lock|pnpm-lock.yaml|poetry.lock|Pipfile.lock|uv.lock|Cargo.lock|go.sum|composer.lock|Gemfile.lock)
                                                  reason="lockfile (update it with the package manager, not by hand)" ;;
esac

case "$path" in
  */.git/*|.git/*) reason="git internals" ;;
esac

if [ -n "$reason" ]; then
  echo "Blocked: '$path' is a protected $reason. Don't edit it directly; tell the user what change is needed and let them make it." >&2
  exit 2
fi

exit 0