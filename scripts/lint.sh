#!/usr/bin/env bash
# Run course-api lint; on failure send output to stderr and exit 2 so Claude sees it.
cd "${CLAUDE_PROJECT_DIR:-.}/course-api" || exit 0
out=$(npm run lint 2>&1) || { echo "$out" >&2; exit 2; }
