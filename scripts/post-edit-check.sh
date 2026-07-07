#!/bin/sh
# Runs after any file edit to catch lint errors immediately.
# ${CLAUDE_PLUGIN_ROOT} resolves to the plugin's install location at runtime.
npm run lint 2>&1 | head -30 || true
