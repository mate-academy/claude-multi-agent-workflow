---
name: code-quality-checklist
description: Checklist and severity rules for judging code quality. Use when reviewing code, looking for code that can be improved, or deciding whether a refactor is worth making.
---

# Code quality checklist

Use this to judge code the same way every time. Read the project's `CLAUDE.md` first and treat its conventions as rules.

## Checklist

- Duplicated logic that could be shared
- Long functions or deep nesting
- Unclear or misleading names
- Missing input validation or error handling
- Dead or unused code
- Magic numbers and strings
- Violations of the project conventions in `CLAUDE.md`
- Paths or behavior with no test coverage
- Inconsistent style within the codebase

Only flag what you can point to in real code. Do not flag personal taste.

## Severity

- **high**: likely bug, data loss, or a broken project convention
- **medium**: hard to maintain or test, but works today
- **low**: cosmetic or minor readability

## Fix safety

- Prefer small edits that keep behavior the same.
- Anything that could change an API response, status code, or data shape is not a safe fix. Mark it needs-human-decision.
- Verify every fix with the project's tests and lint.

## Finding format

```
Q-01 | severity: high|medium|low | path/to/file.js:LINE
Problem: what is wrong and why it matters
Suggested fix: the concrete change to make
Risk: none | could change behavior (explain)
```
