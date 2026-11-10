
---
description: Run a complete multi-agent quality check on the Express API
---

# API Quality Workflow

Analyze the Express API located in course-api/.

## Step 1: Parallel analysis

Launch both subagents:

- code-reviewer: inspect the API and identify bugs,
  security problems, and maintainability issues.
- test-engineer: inspect the API and create or improve
  automated tests.

Run these two tasks in parallel because they
investigate different aspects of the codebase.

## Step 2: Review results

Wait for both agents to finish.

Collect their findings and test results.

## Step 3: Final analysis

Compare the code review findings with the test results.

Identify:
- Bugs without test coverage
- Missing endpoint tests
- Security issues
- High-priority improvements

## Step 4: Final report

Produce a report containing:
1. Code review findings
2. Tests created
3. Test execution results
4. Recommended fixes
