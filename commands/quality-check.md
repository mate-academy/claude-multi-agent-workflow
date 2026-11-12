---
description: Run the code-quality workflow on a path - parallel review and test-gap analysis, then write missing tests.
argument-hint: [path, default course-api]
---
Run a code-quality workflow on `$ARGUMENTS` (default: `course-api`).

**Step 1 - in parallel.** Launch these two subagents in a single message so they run at the same time, since neither needs the other's output:
- the `code-reviewer` subagent: review the target for bugs, security issues, and convention violations.
- the `test-writer` subagent, in analysis-only mode: compare the routes against the existing tests and list untested behaviors. Tell it NOT to write anything yet.

**Step 2 - sequential.** Wait for both results. Then launch the `test-writer` subagent again, giving it the untested-behavior list and the reviewer's findings, and ask it to write tests for those gaps and run `npm test`.

**Step 3 - summary.** Report: reviewer verdict and findings, tests added, and the final test result. Also follow the `api-conventions` skill when judging findings.
