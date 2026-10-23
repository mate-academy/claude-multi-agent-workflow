---
description: Run the api-quality workflow on an API directory (default course-api/): parallel review and gap analysis, then test writing.
argument-hint: [directory]
---

Run a code-quality workflow on the API in `$ARGUMENTS` (use `course-api/` if no argument is given).

**Step 1: in parallel.** These two jobs are independent, so launch both subagents in a single message and let them run at the same time:
- the `api-reviewer` subagent: review the routes and server code against the project conventions.
- the `coverage-analyst` subagent: list the routes and cases that have no tests.

**Step 2: sequential.** Wait for both to finish. Then merge their output: de-duplicate, and turn the reviewer's findings plus the analyst's gaps into one prioritized list of tests to write.

**Step 3: dependent on step 2.** Pass that list to the `test-writer` subagent and have it write the tests and run the suite. It must not start before step 2 is complete, because it needs the merged list.

**Step 4: report.** Give the user a short summary: the review verdict, the gaps found, the tests added, the test result, and any real bugs the new tests exposed. Do not fix application code yourself.
