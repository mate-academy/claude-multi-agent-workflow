---
name: code-quality
description: Code Quality guidance for reviewing and improving code. Use when reviewing code, auditing a module, checking a change before merge, fixing code smells, or deciding how to report and fix quality issues. Covers correctness, validation, error handling, edge cases, maintainability, readability, duplication, and project conventions.
---

# Code Quality

Reusable guidance for reviewing code and fixing quality problems. It applies whether you are reviewing, fixing, or writing code.

## When to use this skill

- Reviewing a file, module, or change for quality problems.
- Fixing issues that a review has found.
- Checking your own edits before reporting a task as done.
- Deciding whether something is a real problem or just a style preference.

## What to check

### Correctness
- Does the code do what its name, comments, and callers expect?
- Look for off-by-one errors, wrong comparisons, inverted conditions, mutated shared state, and missing `await`.

### Validation
- Is input from users, requests, files, or other services checked before use (type, presence, range, format, length)?
- Is validation done at the boundary, and are rejections clear (for example a 400 with a useful message)?

### Error handling
- Are errors caught where something sensible can be done with them, and passed on where not?
- Look for swallowed errors, empty `catch` blocks, unhandled promise rejections, and generic messages that hide the cause.
- Make sure errors never leak secrets or internal details to callers.

### Edge cases
- Empty, null, undefined, zero, negative, very large, duplicate, and malformed values.
- Missing records, concurrent changes, and partial failures.

### Maintainability and readability
- Functions that are long, deeply nested, or do more than one job.
- Unclear names, magic numbers, dead or unused code, and comments that no longer match the code.

### Duplication
- Repeated logic that should be shared. Check with Grep before reporting, and weigh whether the copies are likely to change together. Do not merge code that only looks similar.

### Project conventions
- Follow the patterns already in the codebase: naming, file layout, error format, module style, test style. Read neighbouring files before judging. Existing conventions beat personal preference.

## How to report findings

Make every finding specific enough for someone else to act on without asking questions. Use this format, one finding per issue:

```
### Finding <N> — <severity: high | medium | low>
- File / location: <path>:<line or function>
- Issue: <what is wrong>
- Why it matters: <practical consequence>
- Recommended fix: <the specific change to make>
```

- Order findings from most to least severe and number them.
- Only report issues you have verified in the code. Do not guess.
- Prefer a few real findings over a long list of nitpicks.
- If nothing is wrong, say so.

Severity guide:
- **high:** likely bug, data loss, security exposure, or crash.
- **medium:** fragile or confusing code that will probably cause problems later.
- **low:** minor readability or consistency improvements.

## How to fix

- Fix only the findings you were given. Do not refactor unrelated code.
- Make the smallest change that resolves each issue, and match the surrounding style.
- Keep behavior the same unless the finding is about a bug.
- If a fix is risky, ambiguous, or large, leave it and explain what a person needs to decide.

## Validate your changes

Use the project's own checks instead of inventing new ones:

1. Look in `package.json` scripts, a Makefile, or the README for existing commands such as `test`, `lint`, `format`, `typecheck`, or `build`.
2. Run the ones relevant to the files you changed.
3. If a check fails, fix the cause, or report it clearly if it was already failing before your change.
4. If the project has no checks, say so rather than claiming the code is verified.

State what you ran and what the result was when you report back.
