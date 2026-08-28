---
description: Run the full code-quality workflow against course-api — parallel review of the independent areas of the codebase, then test coverage for whatever the review turns up.
argument-hint: "[path or area to focus on, defaults to all of course-api]"
---

Run the code-quality workflow for course-api. If $ARGUMENTS names a specific path or area, scope the whole workflow to that; otherwise cover all of `course-api/`.

## Step 1 — Parallel review (independent, run together)

The routes in course-api are independent of each other, so review them at the same time instead of one after another. Launch the `api-reviewer` subagent twice in parallel:

- One instance reviews the users flow: `routes/users.js` together with `db/store.js`.
- The other instance reviews the app wiring: `server.js` together with `routes/health.js`.

Wait for both to finish before moving on.

## Step 2 — Test coverage (dependent, waits on Step 1)

This step cannot start until both reviews are back, because it needs their findings to know which edge cases are actually missing coverage (a validation path with no `400` test, a missing-record path with no `404` test, etc.).

Combine both reviewers' findings into one list of gaps and bugs. Then launch the `test-writer` subagent once, handing it that combined list, and have it:
- write or update tests in `course-api/tests/` for the gaps the reviewers found;
- run `npm test` (and `npm run lint` if relevant) to confirm the suite passes;
- report, rather than silently fix, any case where a test fails because of a real bug in the route.

## Step 3 — Report back

Summarize for the user in one pass:
- what each reviewer found (file, problem, triggering scenario);
- what tests were added or changed, and the final pass/fail result;
- any application bug the test-writer flagged instead of fixing, so the user can decide what to do about it.
