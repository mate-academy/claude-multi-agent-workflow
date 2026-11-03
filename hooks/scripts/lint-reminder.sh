#!/usr/bin/env bash
# Runs after any Write or Edit. It doesn't change anything — it just nudges you to
# keep the course API clean by re-running lint and tests after you touch code.
# Referenced from hooks.json through ${CLAUDE_PLUGIN_ROOT} so it works wherever the
# plugin is installed.

echo "[code-quality] File changed. Before you move on, from course-api/ run: npm run lint && npm test"
exit 0
