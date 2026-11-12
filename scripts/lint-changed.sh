#!/usr/bin/env bash
# PostToolUse hook: lint course-api after a file edit. Never blocks; reports only.
if [ -f course-api/package.json ] && [ -d course-api/node_modules ]; then
  (cd course-api && npm run lint --silent 2>&1 | tail -20) >&2
fi
exit 0
