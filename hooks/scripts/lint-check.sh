#!/usr/bin/env bash
# Runs after any Edit/Write, so a route change gets linted right away.
# Resolves relative to this script's own location so it works no matter
# where the plugin is installed — never hardcode an absolute path here.
set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
API_DIR="$PLUGIN_ROOT/course-api"

if [ ! -d "$API_DIR" ]; then
  exit 0
fi

cd "$API_DIR"
npm run lint --silent
