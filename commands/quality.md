---
description: Review code quality and apply verified fixes
---

Run a code-quality workflow on the current project.

First, run these two agents in parallel:
- code-reviewer: review recent code changes for bugs, unclear logic, and maintainability issues.
- test-auditor: audit the tests for missing coverage, weak assertions, and untested edge cases.

After both agents finish, pass their findings to code-fixer.

The code-fixer must verify each finding against the current code before making changes.

At the end, report:
- findings from the code review
- findings from the test audit
- files changed by code-fixer
- fixes applied
- findings that were not safe to fix automatically
