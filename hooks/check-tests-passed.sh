#!/bin/bash
# Blocks any Notion page-creation unless tests actually passed this session.
# Backstops the workflow command's plain-language gate with something deterministic.

STATUS_FILE="$CLAUDE_PROJECT_DIR/.changelog-workflow/test-status"

if [ ! -f "$STATUS_FILE" ] || [ "$(cat "$STATUS_FILE")" != "passed" ]; then
  echo '{"decision": "block", "reason": "Tests have not passed — refusing to post changelog entry to Notion."}'
  exit 0
fi

exit 0