---
description: Run the API quality workflow using parallel review and test analysis followed by a dependent validation step.
---

Run the API quality workflow against the course-api project.

## Step 1 — parallel analysis

Run these two independent subagents in parallel:

1. `code-reviewer`
   - Inspect the API implementation.
   - Look for bugs, validation problems, status-code issues, and missing coverage.
   - Do not modify files.

2. `test-writer`
   - Inspect the existing API tests and implementation.
   - Identify useful missing tests.
   - Add or improve tests where appropriate.
   - Run the relevant tests.

These two activities can happen independently, so run them in parallel.

## Step 2 — dependent validation

After both agents finish:

1. Review their results.
2. Resolve any conflicts between their findings.
3. Run the complete test suite in `course-api`.
4. Run the linter.
5. Report:
   - reviewer findings;
   - tests added;
   - test results;
   - lint results;
   - remaining issues.

Do not declare the workflow successful if tests or lint fail.