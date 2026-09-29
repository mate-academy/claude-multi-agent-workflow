---
description: Run the full pre-merge quality gate on course-api — review the code and keep tests in sync.
---

Run the shipcheck quality gate on `course-api/`.

**Step 1 — run in parallel** (these two are independent, so start both at the same time and wait for both to finish before continuing):
1. Launch the `api-reviewer` subagent to review `course-api/routes/*.js` and `course-api/db/store.js` for bugs, security issues, and convention drift.
2. Launch the `test-writer` subagent in **audit mode**: list every route in `course-api/routes/*.js` and report which ones have no corresponding test in `course-api/tests/`.

**Step 2 — run only after Step 1 completes** (this step depends on both results above, so it cannot start until they're both in hand):
3. Launch the `test-writer` subagent again, this time in **write mode**, passing it the reviewer's findings and the coverage gaps from the audit. Have it add or update tests in `course-api/tests/` to close the coverage gaps and add a regression test for each issue the reviewer flagged, then run `npm test` inside `course-api/` and confirm the suite passes.

Finish by summarizing, in your own words: what the reviewer found, what coverage gaps existed, and what tests were added or changed to close them.
