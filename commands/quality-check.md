Run a full code-quality check on the changes in the current branch.

First, in parallel, launch both subagents at once since neither needs the other's output:
- the `code-reviewer` subagent, to review the changed code for bugs, missing error handling, and unclear names;
- the `test-writer` subagent, to add or update tests in `course-api/tests/` covering the changed behavior, and run the suite.

Once both have finished, produce a single combined report, depending on both results:
- the code-reviewer's findings, grouped by severity (high/medium/low);
- the test-writer's summary of test files touched and the final pass/fail count.

If any high-severity finding was reported, or the test run failed, mark the change **not ready to merge** at the top of the report. Otherwise mark it **ready to merge**.
