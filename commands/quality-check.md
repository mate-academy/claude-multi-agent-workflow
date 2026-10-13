---
description: Review the course API and close test gaps with a parallel-then-sequential multi-agent workflow
argument-hint: "[path to API, default course-api]"
---

Run a code-quality workflow on the API at `$ARGUMENTS` (default: `course-api/`). Follow the steps in order and do not skip the waiting points.

## Step 1 — Gather evidence (run in parallel)

Start all three of these at the same time, in a single turn, because none depends on another:

1. Launch the **api-reviewer** subagent on the `routes/` directory.
2. Launch a second **api-reviewer** subagent on `db/store.js` and `server.js`.
3. In the API directory, run `npm run lint` and `npm test` and capture the output.

## Step 2 — Write tests (depends on Step 1)

Wait for every Step 1 result. Merge the two reviews into one deduplicated list of findings and "untested behaviour". Then launch the **test-writer** subagent, passing it that list plus any failing lint or test output. It needs the reviews, which is why this step cannot start earlier.

## Step 3 — Report

When the test-writer finishes, run `npm test` once more yourself and give the user a short summary:

- findings by severity, with `file:line`
- tests added and the final pass/fail counts
- any application bugs the new tests exposed (do not fix them unless asked)
