---
description: Run the full API quality workflow — parallel review + coverage scouting, then write and run the missing tests.
argument-hint: "[path to the API, default: course-api]"
allowed-tools: Task, Read, Glob, Grep, Bash
---

# API quality check

Target API directory: `$ARGUMENTS` (if empty, use `course-api`). Every subagent below works inside that directory — pass the path to each one explicitly.

Run this workflow using the plugin's subagents. Do not do their work yourself; delegate, wait, and pass results along.

## Step 1 — Review and scout (in parallel)

These two jobs are independent: neither needs the other's output. Launch **both in the same message** so they run concurrently:

- **`api-reviewer`** — review the routes and data layer of the target API against its `CLAUDE.md` conventions. Ask it for its findings table and its list of "behaviours worth a regression test".
- **`coverage-scout`** — map every route branch in the target API to the tests that cover it, and return the coverage table with its summary line.

Wait until **both** have returned before continuing.

## Step 2 — Write the tests (depends on Step 1)

Launch **`test-writer`** once, and only after Step 1 is complete. In its prompt, include:

1. the target API directory,
2. the full "Uncovered" list and runner/helper note from `coverage-scout`,
3. the full "Behaviours worth a regression test" list from `api-reviewer`.

Tell it to de-duplicate the two lists, write the tests only under `tests/`, and run `npm test`.

## Step 3 — Verify and report (depends on Step 2)

Yourself, run `npm test` in the target directory to confirm the suite result the test-writer reported. Then reply with one concise report:

- **Review** — the reviewer's high and medium findings (file:line + one line each).
- **Coverage** — before (from the scout) → after (tests added by the writer).
- **Tests** — files changed and the final `npm test` pass/fail/todo counts.
- **Known bugs** — anything the writer marked as `todo`, with a suggested fix. Do not fix application code in this command; leave that decision to the user.
