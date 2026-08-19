---
description: Run the code-quality workflow against course-api/ — parallel review of routes and tests, then a dependent fix pass.
---

Run the full code-quality workflow against `course-api/`.

## Step 1 — Parallel review

Launch the `code-reviewer` subagent twice, at the same time, since these two reviews don't depend on each other:

- One `code-reviewer` invocation scoped to `course-api/routes/` — review the route handlers for correctness bugs, unhandled error paths, and inconsistency with this codebase's conventions.
- A second, independent `code-reviewer` invocation scoped to `course-api/tests/` — review test coverage and correctness: do the tests actually exercise the routes' behavior and edge cases, and are any assertions wrong or missing.

Both reviews are read-only and touch different files, so run them in parallel rather than one after the other.

## Step 2 — Dependent fix pass

This step cannot start until both reviews from Step 1 have finished, because it needs their combined output.

Merge the findings from both `code-reviewer` runs into a single list, ordered most-severe first. Then hand that merged list to the `code-fixer` subagent and have it apply the fixes, one finding at a time, verifying with `npm test` and `npm run lint` (run from `course-api/`) after each change.

## Step 3 — Confirm

After `code-fixer` finishes, run `npm test` and `npm run lint` from `course-api/` one more time and report the final pass/fail state, plus a short summary of what was found and what was changed. If anything from Step 1's findings was left unfixed, say so explicitly and why.
