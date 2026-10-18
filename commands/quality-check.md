---
name: quality-check
description: Run the full code quality workflow: parallel review plus test analysis, then fixes.
---

Run the code-quality workflow on course-api/:

Step 1 - PARALLEL (run together, independent):
1. Invoke the code-reviewer subagent to review the changed code.
2. Invoke the test-fixer subagent in analysis-only mode to run tests and report failures. Do not fix yet.

Step 2 - DEPENDENT / SEQUENTIAL (waits for Step 1):
3. After BOTH Step 1 results are back, synthesize: if the reviewer found High issues or tests failed, invoke test-fixer to apply fixes.
4. Re-run tests to confirm green.

Return a final summary: findings fixed, tests status, and remaining issues.
