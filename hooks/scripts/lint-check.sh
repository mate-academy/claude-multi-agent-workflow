#!/usr/bin/env bash
set -euo pipefail

if [ -d "course-api" ]; then
  (cd course-api && npm run lint)
fi
