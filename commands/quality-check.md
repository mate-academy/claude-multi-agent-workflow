---
description: Run the full code-quality workflow on course-api — parallel review + test run, then a dependent fix pass.
argument-hint: [path]
---

Run a code-quality pass over `course-api/` (or over `$ARGUMENTS` if a path is given). Follow these steps in order.

## Step 1 — parallel (do this in a single message, both at once)

- Launch the `api-reviewer` subagent to review the Express routes and data-access code (default scope: `course-api/routes/` and `course-api/db/store.js`, or the given path) for validation gaps, incorrect status codes, and error-shape inconsistencies.
- At the same time, run `npm test` and `npm run lint` inside `course-api/` via Bash to capture the current pass/fail and lint state.

These two do not depend on each other — run them together, not one after the other.

## Step 2 — dependent (only after both parts of step 1 have finished)

Combine the reviewer's findings with the test/lint results from step 1. Launch the `test-writer` subagent with that combined context and ask it to:
- add or fix tests for any coverage gap the reviewer flagged,
- fix any failing test or lint error surfaced in step 1,
- re-run `npm test` at the end to confirm everything passes.

This step must wait for step 1 — it needs the reviewer's findings and the test/lint results as input, so it cannot start until both finish.

## Step 3 — summarize

Report back:
- what `api-reviewer` found,
- what the initial `npm test` / `npm run lint` state was,
- what `test-writer` changed,
- the final `npm test` result.
