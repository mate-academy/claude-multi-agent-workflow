---
name: code-quality
description: Practical checklist for reviewing code quality. Use when reviewing, auditing, or assessing code for correctness, security, maintainability, readability and test coverage, or when you need consistent severity levels and a standard report format for findings.
---

# Code Quality Review

Use this skill to review code consistently and report findings in a standard format.

## Process

1. **Scope**: confirm which files or areas are in scope. Skip dependencies, build output and generated files.
2. **Read before judging**: read the code in full, and read the tests that cover it.
3. **Check each area** below, noting only issues you have verified in the code.
4. **Rate and report** each finding using the severity levels and report format at the end.

## Checklist

### Correctness
- Logic errors, wrong conditions, off-by-one mistakes.
- Unhandled edge cases: empty, null or undefined values, missing fields, duplicates, very large input.
- Error handling: errors swallowed, thrown without context, or missing on I/O and async calls.
- Wrong HTTP status codes or response shapes in API handlers.
- State bugs: shared mutable state, race conditions, data mutated unexpectedly.

### Security
- Input validation missing or too weak (type, length, format, range).
- Injection risks: queries, shell commands, file paths, HTML output.
- Secrets or credentials in code, config or logs.
- Missing authentication or authorization on sensitive routes.
- Sensitive data in responses or error messages.
- Unsafe or outdated dependencies and permissive configuration (CORS, headers).

### Maintainability
- Duplicated logic that should be shared.
- Functions or modules doing too many things, or deeply nested logic.
- Dead code, unused variables and imports, leftover debugging code.
- Magic numbers and strings without names.
- Inconsistent patterns compared with the rest of the codebase.

### Readability
- Unclear names for variables, functions and files.
- Comments that are missing for non-obvious behavior, or that restate the code or are out of date.
- Inconsistent formatting or style (defer to the project's linter config).

### Test coverage
- Untested paths: error cases, edge cases, validation failures.
- Weak tests: no meaningful assertions, only the happy path, tests coupled to implementation details.
- Skipped, disabled or flaky tests.
- New behavior added without tests.

## Severity levels

| Severity | Meaning | Examples |
|---|---|---|
| **Critical** | Exploitable or data-destroying; fix before anything else | Injection, exposed secrets, auth bypass, data loss |
| **High** | Likely bug or serious weakness that affects users | Crash on common input, wrong results, missing validation on a public endpoint |
| **Medium** | Real problem with limited impact or a workaround | Unhandled edge case, missing error handling, weak tests for important code |
| **Low** | Minor quality issue | Naming, duplication, dead code, style |

When unsure between two levels, choose the lower one and explain the uncertainty.

## Report format

List findings from most to least severe. For each finding:

```
[SEVERITY] short title
Location: path/to/file.js:LINE
Issue: what is wrong and why it matters
Fix: the specific change to make
```

End with a summary:
- Count of findings per severity.
- The one or two issues to fix first.
- What was checked, if nothing significant was found.

## Rules
- Report only what you verified; do not guess about code you have not read.
- Give a concrete fix for every finding, not just a complaint.
- Keep reports concise: no praise padding and no restating the code.
