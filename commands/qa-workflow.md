---
description: Review an Express route in course-api/ and bring its tests up to date — runs route-reviewer and lint in parallel, then test-writer on the results.
argument-hint: <path to a route file, e.g. course-api/routes/users.js>
---

Run the QA workflow for the route file at `$ARGUMENTS`.

If `$ARGUMENTS` is empty, ask which route file to run against and stop until you
have one. Otherwise proceed.

## Step 1 — Parallel: review and lint (independent, run at the same time)

Kick off both of these together in a single batch and wait for both to finish.
Neither depends on the other:

- **Review** — invoke the `route-reviewer` subagent on `$ARGUMENTS`. Ask it for
  its full findings list (convention broken, line number, offending code, fix)
  and its verdict.
- **Lint** — run `npm run lint` from the `course-api/` directory. Capture the
  full output, and note specifically any warnings or errors whose file path is
  `$ARGUMENTS`.

Do not start Step 2 until both the review findings and the lint results are in
hand.

## Step 2 — Dependent: write tests from what Step 1 found

This step needs the output of both parallel tasks, so it only runs once Step 1
is complete.

Invoke the `test-writer` subagent on `$ARGUMENTS`. Pass it, as context:

- the `route-reviewer` findings from Step 1, and
- any lint problems in `$ARGUMENTS` from Step 1.

Tell it to write or update the tests for this route in the project's existing
style, and to add a test case that exercises each edge case `route-reviewer`
flagged (for example: a flagged missing `404` branch gets a test that hits that
branch, a flagged validation gap gets a `400` test). It should run `npm test`
and finish only with a passing suite.

## Step 3 — Summarize

Report back in three short sections:

- **Review** — `route-reviewer`'s verdict and each finding, one line each.
- **Lint** — pass/fail, and any issue in `$ARGUMENTS`.
- **Tests** — the test file path and whether it was created or updated, the
  cases added (one bullet each, noting which came from a review finding), and
  the final `npm test` result.
