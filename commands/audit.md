---
description: Run a full code-quality audit on course-api — review the routes in parallel, then write tests for any gaps the review finds.
argument-hint: [route-file...]
---

Run a two-stage code-quality audit against `course-api`. If the user gave specific files as `$ARGUMENTS`, audit those; otherwise audit every file under `course-api/routes/`.

## Stage 1 — Parallel review

For each route file being audited, launch the `code-reviewer` subagent. These reviews are independent of each other (each covers one file, none depends on another's output), so launch all of them **in parallel**, in a single batch — do not run them one at a time.

Each `code-reviewer` invocation returns a list of findings for its file: bugs, missing input validation, wrong status codes, or gaps in test coverage.

## Stage 2 — Dependent test writing

Wait for every Stage 1 review to finish, then combine their findings into one list. This stage **depends on Stage 1's output** — do not start it until all reviews are in.

From the combined findings, pull out anything that's a missing-or-weak-test-coverage issue (an untested endpoint, an untested branch like a 400 or 404 path). If there are any, launch the `test-writer` subagent once, passing it the specific coverage gaps to fill — not the whole raw finding list, just the actionable test-coverage items. Let it write or extend the relevant files under `course-api/tests/` and run `npm test` to confirm they pass.

If Stage 1 found no coverage gaps, skip Stage 2 and say so.

## Final report

Report back:
- the full list of findings from Stage 1, grouped by file, most-severe first;
- which of those were coverage gaps handed to `test-writer`;
- what `test-writer` changed and whether `npm test` passed.
