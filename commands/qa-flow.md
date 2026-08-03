---
description: Run the full QA workflow — parallel route audits, then write the missing tests
argument-hint: [path/to/api] (defaults to course-api/)
---

Run the QA workflow on the Express API at $ARGUMENTS (default: `course-api/`). Work from that directory.

**Step 1 — audit in parallel.** List the route files in `routes/`. For each route file, launch one `route-auditor` subagent, all at the same time in a single batch — the audits are independent of each other, so none of them should wait for another. Each auditor gets exactly one route file to check.

**Step 2 — merge (depends on step 1).** Wait for every auditor to return. Combine their findings into one deduplicated list, separating (a) code-convention violations from (b) missing test cases.

**Step 3 — write tests (depends on step 2).** If any test cases are missing, launch a single `test-writer` subagent and hand it the full list of missing cases from step 2. It must run after the audits because its input *is* their output. Do not launch it if there are no gaps.

**Step 4 — report.** Summarise for the user: findings per route file, tests added (with the `npm test` result from the test-writer), and any convention violations that still need a human decision. Do not fix convention violations in application code yourself — report them.
