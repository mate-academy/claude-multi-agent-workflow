---
description: Run the code-quality workflow against course-api — parallel review of routes and store, then dependent test authoring for whatever gaps the review finds.
argument-hint: [path under course-api, defaults to routes/ and db/]
---

Run the full code-quality workflow against `course-api/`. Orchestrate the plugin's two subagents like this:

**Step 1 — parallel review.** Launch the `code-reviewer` subagent twice, at the same time, as two independent Task calls (they don't depend on each other, so run them concurrently rather than one after another):
- one call reviewing `course-api/routes/` (all route handlers),
- one call reviewing `course-api/db/store.js` (the data layer).

Wait for both to finish, then combine their findings into a single list of issues, each tagged with its file and severity.

**Step 2 — dependent test authoring.** Only after both reviews from Step 1 are back, launch the `test-writer` subagent once. Hand it the combined findings from Step 1 as its brief — it must use that list to decide what new or updated test cases belong in `course-api/tests/`. This step is sequential and depends on Step 1's output: it cannot start until you know what gaps the review found. Let it write/edit the tests and run `npm test` from `course-api/` to confirm they pass.

**Step 3 — report.** Summarize for the user: what the parallel review found (by file), what tests were added or changed in response, and the final test run result. If the review found issues the test-writer couldn't cover with a test (e.g. a real bug rather than a missing case), call those out separately as follow-up work.
