#!/usr/bin/env bash
# Blocks session stop when API route or handler files were modified but no
# contract review has been confirmed in this session's transcript.

set -euo pipefail

HOOK_INPUT=$(cat)

# Find route/handler/controller/middleware/validator files in the working-tree diff.
# Works whether the project has a feature branch (diff against main) or only
# unstaged/staged changes (diff against HEAD).
if git rev-parse --verify main >/dev/null 2>&1; then
  CHANGED=$(git diff main...HEAD --name-only 2>/dev/null || true)
else
  CHANGED=$(git diff HEAD --name-only 2>/dev/null || true)
fi

ROUTE_FILES=$(echo "$CHANGED" | grep -iE \
  '(route|handler|controller|middleware|validator|endpoint)' \
  || true)

# Nothing API-related changed — let the session stop normally.
if [[ -z "$ROUTE_FILES" ]]; then
  exit 0
fi

# API files changed. Check whether the transcript already contains output
# from the api-contract-reviewer (a proxy for "review was done").
TRANSCRIPT_PATH=$(echo "$HOOK_INPUT" | jq -r '.transcript_path // ""')

if [[ -n "$TRANSCRIPT_PATH" ]] && [[ -f "$TRANSCRIPT_PATH" ]]; then
  if grep -q 'api-contract-reviewer\|contract review\|Confirmed correct' \
      "$TRANSCRIPT_PATH" 2>/dev/null; then
    # Evidence of a contract review in this session — allow stop.
    exit 0
  fi
fi

# No review found. Block the stop and ask Claude to run one first.
ROUTE_LIST=$(echo "$ROUTE_FILES" | tr '\n' ', ' | sed 's/, $//')

jq -n \
  --arg files "$ROUTE_LIST" \
  '{
    "decision": "block",
    "reason": "API route or handler files were changed this session (\($files)) but no contract review has been recorded. Run the api-contract-reviewer agent (or use /ship) before stopping to confirm the API contract is still consistent. If you have already reviewed and are confident the contract is clean, say so explicitly and I will let you proceed."
  }'
