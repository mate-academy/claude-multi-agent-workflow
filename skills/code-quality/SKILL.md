---
name: code-quality
description: Use when reviewing code quality, test coverage, and maintainability in a project.
---

# Code Quality

Use this skill when the task involves reviewing code quality or test coverage.

## Review focus

- Look for bugs and unclear logic.
- Check error handling and edge cases.
- Check whether important behavior is covered by tests.
- Identify weak or missing assertions.
- Prefer focused, minimal fixes over unrelated refactoring.

## Workflow

Use the `code-reviewer` and `test-auditor` agents for analysis.

Use `code-fixer` only after findings have been reviewed and verified.
