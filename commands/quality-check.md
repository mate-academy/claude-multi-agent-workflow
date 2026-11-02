---
description: Run the full code-quality workflow (parallel review and gap analysis, then test writing) on a path or the whole API
argument-hint: [path, defaults to course-api]
---

Run a code-quality workflow on `$ARGUMENTS` (use `course-api/` if no path was given). Follow these steps in order.

## Step 1 - Parallel analysis

These two jobs are independent, so start them together in a single message with two subagent calls:

- **code-reviewer** subagent: review the target code and return its findings and verdict.
- **Explore** subagent (or a second reviewer pass if unavailable): list every route and its 400/404 paths that has no test in `tests/`, and return that list.

Wait for both to finish.

## Step 2 - Write tests (depends on Step 1)

Only after Step 1 is complete, hand the **test-writer** subagent both results: the coverage gaps and any review findings that can be pinned down with a test. Ask it to add the tests and run the suite.

Run the test-writer in the **foreground**, not as a background agent. It writes files and runs `npm`, and a background agent cannot ask the user to approve those permissions, so it would be blocked. If it is still blocked, tell the user which permission was denied instead of writing the tests yourself.

## Step 3 - Report

Combine everything into one short report:
- review verdict and top findings
- tests added and the final test/lint result
- application bugs that still need a human fix

Apply the `quality-conventions` skill when judging findings. Do not modify application code yourself.
