---
description: Run the full code-quality workflow on course-api (parallel review and test writing, then a combined report)
---

Run the code-quality workflow on the API in `course-api/`. Optional focus from the user: $ARGUMENTS (if empty, cover all of `routes/` and `db/`).

## Step 1: in parallel
These two jobs are independent, so start both subagents in the same message and let them run together:
- **api-reviewer**: review `course-api/routes/` and `course-api/db/store.js` against the project conventions and return its findings list.
- **test-writer**: find endpoints without tests, add node:test + supertest cases under `course-api/tests/`, and return what it added plus the `npm test` result.

## Step 2: after both finish
This step needs the results of step 1, so do not start it earlier:
1. Run `npm test` and `npm run lint` inside `course-api/` yourself, now that the new tests exist.
2. Combine everything into one report:
   - **Blockers**: reviewer `blocker` findings, failing tests, lint errors.
   - **Should fix**: reviewer `should-fix` findings and lint warnings.
   - **Added**: the tests the test-writer created.
   - **Next action**: the single most valuable fix to do first.

## Rules
- Do not change production code (`routes/`, `db/`, `server.js`). Only the test-writer may write files, and only under `course-api/tests/`.
- If a subagent reports a suspected bug, put it in the report instead of fixing it.
