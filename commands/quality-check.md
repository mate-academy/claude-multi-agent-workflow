---
description: Run the full code-quality workflow on the current project - parallel review and checks, then targeted test writing.
---
Run a code-quality workflow on the project in the current directory (or the path given in $ARGUMENTS). Follow these steps in order.

## Step 1 - Gather findings (run these in parallel)

Start all three of these at the same time, in a single message, since none depends on another:

1. Use the `code-reviewer` subagent to review the source files and report bugs, convention violations, and test gaps.
2. Run the project's linter (`npm run lint`) and capture the output.
3. Run the project's test suite (`npm test`) and capture the pass/fail result.

## Step 2 - Write missing tests (depends on Step 1)

Wait until all three results from Step 1 are back. Then pass the reviewer's "Test gaps" list and any failing test output to the `test-writer` subagent and ask it to add tests for those gaps. If there are no gaps and no failures, skip this step.

## Step 3 - Report

Finish with a short summary: lint result, test result before and after, the reviewer's high-severity findings, the tests that were added, and anything that still needs a human decision.
