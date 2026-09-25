#!/usr/bin/env bash
# Runs ESLint --fix on the file that was just written or edited.
# Only acts on .js files; exits silently for everything else.
FILE="${CLAUDE_TOOL_INPUT_FILE_PATH:-}"
[[ "$FILE" == *.js ]] || exit 0
npx eslint --fix "$FILE" 2>/dev/null
