---
description: Review API changes and improve their tests with parallel analysis followed by verification.
argument-hint: <base-ref>
---
Run the api-quality workflow against course-api. Use $ARGUMENTS as the base ref; if absent, inspect the branch and ask which base to compare when ambiguous. Obtain the actual Git diff and freeze a snapshot of the changed route files. Never invent a diff or test output.
1. In parallel, delegate the immutable route diff plus docs/store paths to api-reviewer, and delegate the same snapshot plus existing test paths to api-test-writer. The reviewer is read-only; the writer owns only course-api/tests/*.test.js. Neither worker may edit routes. Both can analyze the API independently.
2. Wait for BOTH workers to finish. Gather the reviewer findings and writer file list. Resolve ambiguous requirements with the user before making dependent edits.
3. Sequentially run npm --prefix course-api test and npm --prefix course-api run lint after test edits settle. Preserve failures and actual output; do not silently weaken assertions.
4. Only after those checks, pass the final diff, both workers reports, and check output to api-reviewer for a final read-only assessment. This dependent review must wait for the edited tests and their results.
5. Return a PR-ready summary: changes, confirmed findings, checks actually run, unresolved items. Do not commit, push, merge, publish, or change permissions.
