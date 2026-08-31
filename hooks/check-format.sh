#!/bin/bash

# Pre-commit format checker

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-.}"

echo "Checking for trailing whitespace..."
trailing_ws=$(find . -type f \( -name "*.js" -o -name "*.py" -o -name "*.md" \) -exec grep -l '[[:space:]]$' {} \;)

if [ -n "$trailing_ws" ]; then
  echo "Files with trailing whitespace found:"
  echo "$trailing_ws"
  exit 1
fi

echo "Checking for missing final newlines..."
missing_newline=$(find . -type f \( -name "*.js" -o -name "*.py" \) -exec sh -c 'tail -c1 "$1" | od -A none -t x1 | grep -q "0a" || echo "$1"' _ {} \;)

if [ -n "$missing_newline" ]; then
  echo "Files missing final newline:"
  echo "$missing_newline"
  exit 1
fi

echo "Format check passed"
exit 0
