---
description: Run the full code-quality workflow against course-api — a parallel review and coverage scan, then a dependent step that writes and verifies tests.
---

Run the code-quality workflow against the `course-api/` Express service, in this order:

## Step 1 — parallel: review + coverage scan

Launch both of these at the same time, in parallel, since neither depends on the other — they're both read-only passes over the same unchanged code:

- Launch the `code-reviewer` subagent to review the current changes (or, if nothing is staged/changed, the whole of `routes/` and `db/store.js`) for correctness bugs and convention violations.
- Launch the `test-writer` subagent in **scan mode** — ask it only to report which behaviors in `routes/` are not covered by `tests/`, without writing anything yet.

Wait for both to finish before moving on.

## Step 2 — dependent: write and verify tests

This step depends on Step 1's results and must not start before both finish:

- Take the coverage gaps from `test-writer`'s scan, plus any testability-relevant findings from `code-reviewer` (e.g. a missing validation branch that also means a missing test case), and hand them back to the `test-writer` subagent in **write mode** to actually create or update the test files.
- Have it then run `npm test` from `course-api/` to confirm the new and existing tests pass.

## Step 3 — report

Combine both subagents' output into one summary for the user:
- the review findings (or "no issues found"),
- what test coverage was missing and what was added,
- the final `npm test` result.

If `npm test` fails after Step 2, report the failure clearly instead of silently retrying or fixing unrelated code.
