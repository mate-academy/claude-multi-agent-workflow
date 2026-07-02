#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -d "course-api" ]; then
  (cd course-api && npm test >/tmp/quality-check.log 2>&1) || {
    echo "Quality check failed" >&2
    cat /tmp/quality-check.log >&2
    exit 1
  }
fi
