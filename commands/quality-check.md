---
description: Review course-api routes, run existing tests and lint, then add tests for High and Medium findings
---

Run this quality check on `course-api/` as a workflow.

**Step 1 — in parallel** (launch both at the same time, in one message):
- Use the `reviewer` agent to review the route files in `course-api/routes/`.
- Use a `general-purpose` agent to run `npm test` and `npm run lint` in `course-api/` and report any failures.

**Step 2 — after both finish:** use the `test-writer` agent to write tests for the High and Medium findings only (ignore Low), and run them.

**Step 3:** give one short summary: findings, tests added, and which pass or fail.
