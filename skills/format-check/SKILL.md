---
name: format-check
description: Check and report code formatting issues without modifying files
---

# Code Format Checker

Scans code files for common formatting issues and style violations.

**What it does:**
- Identifies inconsistent indentation (tabs vs spaces)
- Detects trailing whitespace
- Checks for missing newlines at end of files
- Reports line length violations (>100 chars)
- Flags inconsistent quote styles (single vs double)

**Output:**
A detailed report showing:
- File path
- Line number and issue type
- The problematic line
- Suggested fix

**When to use:**
Before committing code, or as part of a pre-push hook to enforce consistency.

This skill is read-only and never modifies files — it just reports issues for you to fix or to pass to `/simplify` for automated cleanup.
