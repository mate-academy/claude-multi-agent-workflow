#!/bin/bash

# Pre-release validation checks

echo "🔍 Running pre-release checks..."

# Check that working directory is clean
if ! git diff-index --quiet HEAD --; then
  echo "❌ Error: Working directory has uncommitted changes. Commit or stash before release."
  exit 1
fi

# Check that we're on main/master branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
  echo "⚠️  Warning: You're on branch '$CURRENT_BRANCH', not main. Consider releasing from main."
fi

# Check that package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. This release plugin requires a package.json file."
  exit 1
fi

echo "✅ Pre-release checks passed. Ready to release."
exit 0
