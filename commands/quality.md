---
name: quality
description: Run a full code-quality pass on the course API — review all routes in parallel, then write tests targeting the issues found.
---

Run a full code-quality workflow against the course API in course-api/.

## Step 1 — Review all routes in parallel

Spawn two code-reviewer agents at the same time, one per route file. These are independent and must run concurrently:

- **Agent A**: invoke the `code-reviewer` subagent on `course-api/routes/users.js`
- **Agent B**: invoke the `code-reviewer` subagent on `course-api/routes/health.js`

Wait for both to finish before moving on. Collect their two structured reports (Issues, Warnings, Verdict for each file).

## Step 2 — Write tests for the issues found (depends on Step 1)

Only start this step once both reviews from Step 1 are complete.

Invoke the `test-writer` subagent and pass it the combined findings: the list of issues and edge cases identified across both route files. Instruct it to:
1. Add test cases that cover every Issue flagged in either review report.
2. Skip any case already covered by an existing test.
3. Run `npm test` from course-api/ and confirm all tests are green before returning.

## Final output

After all three agents have finished, present a summary that covers:
- The verdict for each route (from the two review reports)
- The test cases added (from the test-writer report)
- The final test pass/fail count
