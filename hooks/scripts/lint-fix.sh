#!/usr/bin/env bash
# Runs after every Edit/Write so lint-autofixable issues never survive a review pass.
set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
API_DIR="${PLUGIN_ROOT}/course-api"

[ -d "$API_DIR" ] || exit 0

cd "$API_DIR"
npx eslint server.js routes db tests --fix --quiet 2>/dev/null || true
