---
description: "Run the code-quality workflow against course-api: parallel review + tests, then a dependent fix pass."
argument-hint: "[path, defaults to course-api]"
---

# Code quality audit

Run a full code-quality audit of `course-api/` (or `$1` if given) using this plugin's subagents.

## Step 1 — Parallel: review and test independently

Kick off both of these at the same time — neither depends on the other's output:
- Launch the `reviewer` subagent against `course-api/` (or `$1`). It checks convention compliance against course-api/CLAUDE.md and flags test coverage gaps. It is read-only.
- At the same time, run the project's own checks: `cd course-api && npm test` and `npm run lint`, capturing pass/fail output.

Wait for both to finish before moving on — do not start Step 2 with partial results.

## Step 2 — Dependent: fix based on Step 1's combined output

This step needs Step 1's results as its input, so it cannot start until Step 1 completes. Hand the reviewer's findings and the test/lint results to the `fixer` subagent as a scoped task list. Ask it to:
- Apply any concrete, well-specified fixes the reviewer flagged.
- Write any missing tests the reviewer identified (e.g. POST /users' 400 path, PUT /users/:id's 400 path, a new tests/health.test.js if missing).
- Re-run `npm test` and `npm run lint` after making changes to confirm nothing broke.

## Final report
Summarize: what the reviewer found, the initial test/lint results, what the fixer changed, and the final test/lint status.
