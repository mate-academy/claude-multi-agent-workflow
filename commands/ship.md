---
description: Run the full code-quality workflow against course-api — review, then fix and test — before you ship a change.
---

Run the code-quality workflow for the Express API in `course-api/`. Follow these steps in order:

**Step 1 — parallel review.** Launch two independent `code-reviewer` subagent runs at the same time, since they read disjoint parts of the codebase and don't depend on each other:
- One `code-reviewer` run scoped to `course-api/routes/` and `course-api/db/store.js` — bugs, convention violations, and security issues in the request-handling and data layer.
- Another `code-reviewer` run scoped to `course-api/tests/` — coverage gaps and weak assertions against the routes above.

Wait for both to finish before continuing.

**Step 2 — dependent fix-and-test.** This step depends on Step 1's output, so it cannot start until both reviews are back. Combine the findings from both `code-reviewer` runs into one list of concrete items (bugs to fix, tests to add). Hand that combined list to a single `test-writer` subagent run and have it work through every item: fix each bug in place, add a test for each coverage gap, and run `npm test` and `npm run lint` from `course-api/` after its changes to confirm everything is green.

**Step 3 — report.** Once `test-writer` returns, summarize for the user: what `code-reviewer` found in each area, what `test-writer` changed for each finding, and the final test/lint status. If anything is still failing, say so explicitly instead of calling the run clean.
