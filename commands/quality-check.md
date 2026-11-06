---
description: Run a multi-agent quality review and test workflow for the Express API
---

Run the API quality workflow against the project in `course-api/`.

1. Start the `api-reviewer` and `api-tester` subagents in parallel.

2. Wait for both agents to finish. Collect the review findings from `api-reviewer` and the test coverage summary and execution results from `api-tester`.

3. After both results are available, compare the review findings with the test results. Identify issues that are not covered by tests and tests that may be needed to verify review findings.

4. Return one consolidated report containing:
   - Review findings grouped by severity.
   - Tests added or changed and their results.
   - Uncovered risks and recommended next steps.
   - A clear overall quality assessment.

Do not claim that an issue is fixed unless the test results and code changes confirm it.
