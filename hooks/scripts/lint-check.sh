#!/bin/bash
# Runs the course-api linter after an edit, as a non-blocking quality signal.
cd "${CLAUDE_PLUGIN_ROOT}/course-api" 2>/dev/null || exit 0
npm run lint --silent
exit 0
