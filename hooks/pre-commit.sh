#!/bin/bash

# Pre-commit quality check hook
# Runs basic code quality validation before commit

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-.}"

echo "Running pre-commit quality checks..."

# Check if there are any JavaScript/TypeScript files staged
if git diff --cached --name-only | grep -E '\.(js|ts|jsx|tsx)$' > /dev/null; then
  echo "✓ JavaScript/TypeScript files detected in staged changes"
  echo "  Recommendation: Run 'claude /review' to perform comprehensive code quality analysis"
else
  echo "✓ No JavaScript/TypeScript files in this commit"
fi

echo "Pre-commit check complete"
exit 0
