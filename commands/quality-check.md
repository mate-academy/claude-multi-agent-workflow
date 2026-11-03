---
description: Review the course API's route files against the project conventions, then add regression tests for whatever the review turns up.
---

# /quality-check

Run a two-stage code-quality pass over the course API in `course-api/`.

## Step 1 — Review the routes (run these in parallel)

The two route files are independent, so review them at the same time. Launch the
`api-reviewer` subagent twice in a single step — don't wait for one to finish
before starting the other:

- One `api-reviewer` on `course-api/routes/users.js`.
- One `api-reviewer` on `course-api/routes/health.js`.

Collect both reports.

## Step 2 — Add regression tests (depends on Step 1)

This step waits for Step 1 — it needs the findings before it can do anything.

Take the findings from both reviews and hand them to the `test-author` subagent.
Ask it to write or extend tests under `course-api/tests/` that cover the issues
the reviewers raised (and the important happy-path behaviour if a route has no test
at all yet), then run `npm test` from `course-api/` and confirm they pass.

## Step 3 — Report back

Summarize for me in plain language:
- what each reviewer found,
- what tests were added and whether `npm test` is green,
- anything that looks like a real bug in a route (not just a missing test).
