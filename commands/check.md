---
description: "Run the QA crew on one course-api file: review and tests in parallel, then one combined report"
argument-hint: <file path>
---

Work on the course-api file $ARGUMENTS. In parallel, run the code-reviewer subagent to review that file and the test-writer subagent to write missing tests for it - they don't depend on each other. When both have finished, run the full course-api test suite once, then write one combined report with three parts: the review findings grouped by severity, the test files that were added or changed, and the final pass/fail result. Don't commit anything.
