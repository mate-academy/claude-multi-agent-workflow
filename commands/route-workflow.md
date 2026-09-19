Run the full route-change workflow for `course-api`: check the route(s) for convention and documentation compliance, then bring the tests in line.

Figure out which route(s) are in scope — whichever route file(s) were just created or changed in `course-api/routes/`, or the ones the user names. Then follow these instructions:

## Step 1 — Parallel review (independent, run together)

Both of these only read code and don't depend on each other, so run them at the same time:

- Launch the `route-reviewer` subagent to check the route(s) against the conventions in `course-api/CLAUDE.md` (mounting, data access via `db/store.js`, validation status codes, error shape).
- At the same time, compare the same route(s) against their descriptions in `course-api/docs/api.md`: for each route, confirm it's documented and that the documented method, path, params, and responses match what the code actually does. Report each route as Synchronized / Not synchronized, following the same route-group format used for the review below.

## Step 2 — Dependent step: bring tests in line

Only after both parallel checks in Step 1 have finished, launch the `test-writer` subagent to update `course-api/tests/` so it matches the route(s)' current, reviewed behavior. This step is deliberately sequenced after Step 1 — writing tests against routes that haven't been checked for convention or doc drift risks locking in behavior that's about to be flagged as wrong.

## Step 3 — Report

Give the user one combined summary with three parts, in this order:

1. Convention compliance (from `route-reviewer`):

[route file name] - Compliant / Not compliant
- [route (method + path)] - Compliant / Not compliant
  - [if not compliant: which convention is violated and why]

2. Documentation sync (from the parallel doc check):

[routes group] - Synchronized / Not synchronized
- [route (method, url and name)] - Synchronized / Not Synchronized

3. Tests changed (from `test-writer`):

Tests changed:
- [test file name]
  - [route (method + path)] - [brief description of what was added/updated]

Test run: [pass/fail summary]
