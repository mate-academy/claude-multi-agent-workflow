#!/bin/bash
# Post-agent hook for code-review plugin
# This script runs after any Agent tool use
# References ${CLAUDE_PLUGIN_ROOT} for plugin-relative paths

# Get the agent result from the environment or output
# This hook runs after Agent tool calls, useful for code-review workflows

echo "Code review plugin: post-agent hook executed"
echo "Plugin root: ${CLAUDE_PLUGIN_ROOT}"

# Optional: Parse and summarize agent findings
if [ -n "$AGENT_FINDINGS" ]; then
  echo "Findings captured from agent run"
  echo "$AGENT_FINDINGS" | head -20
fi

# Optional: Save findings to a report file
REPORT_FILE="${CLAUDE_PLUGIN_ROOT}/reviews/review-$(date +%Y%m%d-%H%M%S).md"
mkdir -p "$(dirname "$REPORT_FILE")"

echo "Code review completed" > "$REPORT_FILE"
echo "Timestamp: $(date)" >> "$REPORT_FILE"

# Echo result for visibility
echo "Post-agent hook complete"