---
description: Run a code quality workflow on a path - review, lint and tests in parallel, then fill test gaps
argument-hint: "[path to review, default: recent changes]"
---

Run a code quality workflow on `$ARGUMENTS`. If no path was given, use the files changed most recently.

## Step 1 - run these three in parallel

Start all three at the same time in a single message. None depends on the others.

1. Use the `quality-reviewer` subagent to review the target. Ask it for its findings and its list of untested behaviour.
2. Run the project's lint command (`npm run lint`) and keep its output.
3. Run the project's test suite (`npm test`) and keep its output.

## Step 2 - wait for step 1, then close the test gaps

This step depends on the reviewer's list of untested behaviour, so do not start it until step 1 has finished.

Use the `test-writer` subagent. Give it the reviewer's list of untested behaviour, and the output of any failing test from step 1. If the reviewer found no gaps, skip this step.

## Step 3 - report

Run the test suite and the linter one more time, then write one short report:

- the reviewer's findings, grouped by severity
- lint results before and after
- tests before and after, plus the tests the test-writer added
- any bug that a new test exposed, which still needs a human to fix

Do not edit application code yourself.
