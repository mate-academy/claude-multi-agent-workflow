Run the Code Quality workflow for the Express API in `course-api/`.

1. In parallel, run these two independent workers:
   - `code-quality-workflow:code-reviewer` to inspect the API read-only and report correctness, security, maintainability, and test-coverage findings.
   - `code-quality-workflow:test-fixer` to run the existing tests and make only safe, focused fixes backed by test or lint/format evidence.
2. After both workers finish, run a dependent validation step that reviews their outputs together, checks the final working tree, reruns the relevant tests, and reports whether the API is in a healthier state.
3. Summarize the workflow outcome with: findings, files changed, validation commands/results, and remaining risks.

The reviewer must not edit files. The fixer may edit files. Keep the workflow focused on `course-api/` and do not modify plugin infrastructure during the workflow.
