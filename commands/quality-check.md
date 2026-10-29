---
description: Run the full code quality workflow (parallel review + gap analysis, then test writing) on a path
argument-hint: [path, defaults to course-api]
---
Run a code quality workflow on `$ARGUMENTS` (use `course-api/` if empty).

**Step 1 — in parallel.** Launch these two independent tasks at the same time, in a single message:
- the `code-reviewer` subagent: review the target for bugs, missing validation and convention violations;
- the `test-writer` subagent in analysis-only mode: read the code and `tests/` and list, without writing anything, which routes and edge cases have no test.

**Step 2 — sequential, after both finish.** Combine the two results. Pass the untested behaviours and any review findings that can be covered by a test to the `test-writer` subagent and have it write the tests and run `npm test`.

**Step 3 — summary.** Report the review findings by severity, the tests added, the final test result, and anything left for a human to fix. Apply the `api-conventions` skill when judging findings.
