---
name: code-review-checklist
description: Use when reviewing code for quality. Provides the checklist for correctness, security, tests, and style.
---

# Code Review Checklist

Before approving, check:
1. Correctness: Does it handle empty input, null, and 404/400 cases?
2. Security: Is user input validated? No hardcoded secrets?
3. Tests: Is there a test for the happy path and the error path?
4. Style: Is the code formatted and naming clear?

Return findings as High/Medium/Low with file:line.
