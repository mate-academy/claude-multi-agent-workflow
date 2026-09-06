---
description: Run the full code-quality workflow against course-api — parallel review of the routes and the data/test layer, then a dependent pass that writes tests for whatever the reviews found missing.
---

Run the code-quality workflow against `course-api/`:

**Step 1 — parallel review.** Launch two `code-reviewer` subagents at the same time, as independent work:
- Reviewer A: review everything under `course-api/routes/` for logic bugs, missing input validation, and security issues.
- Reviewer B: review `course-api/db/` and `course-api/tests/` for data-layer bugs and gaps in current test coverage.

Do not start anything else until both reviewers have returned their findings — they don't depend on each other, so they should run concurrently rather than one after the other.

**Step 2 — combine findings.** Once both reviews are back, merge their findings into one de-duplicated list, and pull out the "untested behaviors" each reviewer flagged.

**Step 3 — dependent test-writing pass.** This step depends on step 1 and 2 and must not start before they finish. Launch the `test-writer` subagent with the combined list of untested behaviors and any bugs that need regression coverage, so it writes or updates tests under `course-api/tests/` and runs `npm test` to confirm the suite passes.

**Step 4 — report.** Summarize for the user: what each reviewer found (grouped by severity), what tests were added or changed by `test-writer`, and the final test run result. Call out anything from the reviews that is still unresolved (real bugs that need a human decision, not just a missing test).
