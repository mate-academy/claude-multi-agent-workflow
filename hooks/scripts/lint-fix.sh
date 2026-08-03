#!/usr/bin/env bash
FILE_PATH=$(cat | grep -o '"file_path"[^,}]*' | sed -E 's/.*"file_path"\s*:\s*"([^"]*)".*/\1/')

case "$FILE_PATH" in
  */course-api/*.js)
    (cd "$(dirname "$FILE_PATH")/.." 2>/dev/null && npx eslint --fix "$FILE_PATH" 2>/dev/null) || true
    ;;
esac

exit 0
