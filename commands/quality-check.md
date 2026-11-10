---
description: Run the full code-quality workflow (parallel review, then tests, then verification) on the course API
argument-hint: [folder, default = course-api]
---

Run the quality workflow on `$ARGUMENTS` (default: `course-api/`). Follow these steps exactly and in this order.

**Step 1 — Parallel review (independent work, launch together).**
In a single message, launch two `code-reviewer` subagents at the same time:
- one reviewing the `routes/` folder,
- one reviewing `db/store.js` and `server.js`.
They do not depend on each other, so do not wait for one before starting the other.

**Step 2 — Dependent step (waits for Step 1).**
Only after both reviewers have returned, merge their findings and their "Untested behaviour" lists, de-duplicate them, and pass that merged list to the `test-writer` subagent so it adds tests for the gaps. This step needs the reviewers' output, so it must not start earlier.

**Step 3 — Verify (waits for Step 2).**
Run `npm run lint` and `npm test` in the API folder and report the results.

**Final report.** Show: high/medium findings with `file:line`, the tests that were added, and the lint/test status. If anything fails, say so plainly.
