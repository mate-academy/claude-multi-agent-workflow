---
description: Run the full code-quality workflow on an API folder (review, coverage, then tests)
argument-hint: [path to API folder, default course-api]
---

Run a code-quality workflow on the API in $ARGUMENTS (use course-api if no path is given).

Step 1 (parallel): launch these two subagents at the same time, because they are independent and both only read code:
- code-reviewer: review the routes, store and server setup and report findings.
- coverage-scout: list which endpoints and cases are tested and which are missing.

Step 2 (sequential, waits for step 1): when both reports are back, call test-writer.
Give it the missing cases from coverage-scout plus any bug from code-reviewer that deserves a regression test.
It must add the tests and run npm test until they pass.

Step 3: summarise for the user in three short sections: review findings, tests added, final test result.
