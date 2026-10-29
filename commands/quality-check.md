---
description: Run the full API quality workflow — parallel review and baseline checks, then tests for the gaps, then a final verification
argument-hint: "[api folder, default: course-api]"
---

Run a code quality pass on the API in `$ARGUMENTS` (if that is empty, use `course-api`). Call that folder the TARGET. Follow these steps in order. Do not skip ahead.

## Step 1 — Review and baseline, all at the same time (parallel)

These three jobs do not depend on each other, so start all of them in the same turn so they run simultaneously:

- Launch the `api-reviewer` subagent on the TARGET's `routes/` folder.
- Launch a second `api-reviewer` subagent on the TARGET's `db/` folder and `server.js`.
- While they run, yourself run `npm test` and `npm run lint` inside the TARGET (run `npm install` first if `node_modules` is missing) and write down the baseline: how many tests pass or fail and how many lint problems exist.

Wait until all three have finished before moving on.

## Step 2 — Merge the findings (depends on step 1)

Using the two review reports, build one list: remove duplicates, order by severity (high first) and collect every item under TEST GAPS. If the reviewers found nothing to cover, skip step 3 and say so in the final report.

## Step 3 — Write the missing tests (depends on step 2)

Launch the `test-writer` subagent once, giving it the TARGET folder and the merged TEST GAPS list from step 2. It needs those results, which is why it cannot start earlier. Wait for its report.

## Step 4 — Verify and report (depends on step 3)

Run `npm test` and `npm run lint` again in the TARGET and compare against the baseline from step 1. Then give the user one short report:

1. Baseline vs. final test and lint numbers.
2. The merged findings, high severity first, each with file and line.
3. The tests that were added.
4. Anything the test writer flagged as needing a source fix.

Rules for the whole run: never edit source files yourself and never ask the subagents to — the only files this workflow may change are test files. Offer the source fixes as a next step instead of making them.
