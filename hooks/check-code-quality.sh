#!/bin/bash

# Code Quality Check Hook
# Runs basic linting checks on modified JavaScript/TypeScript files
# Called after files are written by Claude

FILE=$1

# Check if file exists
if [ ! -f "$FILE" ]; then
    exit 0
fi

# Basic syntax check for JavaScript/TypeScript files
case "$FILE" in
    *.js|*.jsx|*.ts|*.tsx)
        # Check for common issues using grep patterns

        # Warn about console.log left in code (debugging)
        if grep -q "console\\.log" "$FILE"; then
            echo "⚠️  Warning: console.log found in $FILE"
        fi

        # Warn about commented-out code blocks
        if grep -q "^\s*//.*=\|^\s*/\*.*=\|^\s*console\\.log.*=\|^\s*if.*{" "$FILE" | grep -q "//"; then
            echo "⚠️  Note: Commented code detected in $FILE"
        fi

        # Check for missing semicolons in key places
        if grep -E "^[^/].*[a-zA-Z0-9\)\]]$" "$FILE" | grep -v ";" | grep -v "{" | grep -v "}" >/dev/null 2>&1; then
            echo "ℹ️  Info: Review semicolon usage in $FILE"
        fi

        echo "✓ Code quality checks completed for $FILE"
        ;;
    *)
        # Skip non-code files
        ;;
esac

exit 0
