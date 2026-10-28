---
description: Run the code quality workflow (parallel review + baseline checks, then test writing, then a report)
argument-hint: [project path, default course-api]
---

Run a code quality workflow on the project at `$ARGUMENTS` (use `course-api` if no argument was given).

## Step 1 — in parallel
In a single message, start all of these at the same time, since none depends on another:
- A `code-reviewer` subagent: review correctness and conventions of `server.js`, `routes/`, and `db/`.
- A second `code-reviewer` subagent: do a test-gap analysis. Compare every route and status-code branch with the files in `tests/` and list the untested cases.
- Run the baseline `npm test` and `npm run lint` in the project directory.

Wait for all three to finish.

## Step 2 — sequential, depends on Step 1
Hand both reviewer reports and the baseline results to the `test-writer` subagent. It adds tests for every test gap and for each high or medium finding, then runs `npm test`.

## Step 3 — sequential, depends on Step 2
Write a combined report: findings by severity, tests added, final test and lint status, and any app bugs exposed by failing tests. Report bugs; do not fix application code.
