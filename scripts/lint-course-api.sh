#!/usr/bin/env bash
set -euo pipefail

project_dir="${CLAUDE_PROJECT_DIR:-}"
api_dir="${project_dir}/course-api"

if [[ -z "$project_dir" || ! -f "$api_dir/package.json" ]]; then
  exit 0
fi

cd "$api_dir"
npm run lint
