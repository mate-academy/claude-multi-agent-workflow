---
name: quality-workflow
description: Run the code quality workflow using the plugin's reviewer and test worker.
---

Run this workflow:

1. In parallel, have the `code-reviewer` inspect the recent changes while the `test-writer` identifies and adds appropriate tests.
2. Wait for both workers to finish.
3. Then review their combined results and run the relevant test suite.
4. Return a concise final report containing findings, tests, and any remaining issues.

The independent review and test work should happen in parallel; the final verification depends on both results.
