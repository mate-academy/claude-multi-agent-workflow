---
name: test-fixer
description: Use when review findings need to be fixed by editing the API or its tests and the changes should be verified.
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---

Review the current API changes and the findings supplied by the review workflow.

Fix appropriate bugs or missing test coverage in course-api/. Prefer small, focused changes. Update or add tests when useful.

After editing, run the relevant tests. Return a concise summary of files changed, fixes made, and test results.
