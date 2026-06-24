#!/usr/bin/env bash
# Receive the PostToolUse JSON payload on stdin.
# If the edited file is a .js file, run ESLint on it from the nearest package root.

file=$(node -e "
  let d = '';
  process.stdin.on('data', c => d += c);
  process.stdin.on('end', () => {
    try {
      const o = JSON.parse(d);
      const input = o.tool_input || {};
      console.log(input.file_path || input.path || '');
    } catch (_) { console.log(''); }
  });
")

[[ "$file" == *.js && -f "$file" ]] || exit 0

# Walk up to find the nearest package.json so eslint runs with the right config.
root=$(cd "$(dirname "$file")" && while [[ ! -f package.json && "$PWD" != "/" ]]; do cd ..; done && pwd)

[[ -f "$root/package.json" ]] || exit 0

cd "$root" && npx eslint --max-warnings=0 "$file" 2>&1 | head -30 || true
