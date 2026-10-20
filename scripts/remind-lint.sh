#!/usr/bin/env bash
# Lightweight reminder after Write/Edit — keep style checks in mind for JS/Express work.
# Uses CLAUDE_PLUGIN_ROOT so the path resolves wherever the plugin is installed.
set -euo pipefail

echo "[code-quality] File changed. If you edited course-api JS, consider: cd course-api && npm run lint"
exit 0
