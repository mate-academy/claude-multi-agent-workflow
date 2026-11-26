---
description: Audit the API: review code and find test gaps in parallel, then write the missing tests.
argument-hint: [files or folders to audit]
---

Run a quality audit of the Express API in course-api/ as a workflow of three subagents.

Scope: $ARGUMENTS
If the scope is empty, audit the whole API (course-api/routes/, course-api/db/ and course-api/tests/).

## Step 1 - Review and find gaps (in parallel)

Launch these two subagents at the same time, in a single message, because they are independent and only read code:
- code-reviewer (api-quality:code-reviewer): review the code in scope and return issues grouped by severity with file:line.
- test-gap-finder (api-quality:test-gap-finder): compare the routes in scope with the tests and return the coverage table.

Wait for both to finish before going on.

## Step 2 - Write the missing tests (depends on Step 1)

Launch the test-writer subagent (api-quality:test-writer) only after Step 1 is done. Pass it both results in full:
- the issue list from code-reviewer;
- the coverage table from test-gap-finder.

Ask it to write tests for the gaps and for the high and medium issues, run npm test, and return its report.

## Step 3 - Report to the user

Do not change any code yourself. Combine the results into one short report:
1. Code issues: the high and medium items from code-reviewer (file:line and fix).
2. Coverage: the totals line from test-gap-finder.
3. Tests added: the list from test-writer.
4. Test run: pass and fail numbers, and for each failing test whether it is an API bug or a test problem.
