---
description: Run the quality gate on this branch - parallel review and docs check, then tests for anything untested
argument-hint: "[path to the API, default: current directory]"
---
Run the quality gate as a workflow of subagents on the Express API in this folder: $ARGUMENTS (if that is empty, use the current directory). Follow this order exactly.

**Step 1 - in parallel.** First run `git diff --name-only main...HEAD` yourself to get the files changed on this branch (the reviewer is read-only and can't run git). Then, at the same time:
- use the `code-reviewer` subagent, passing it that exact file list;
- use the `docs-checker` subagent on `docs/api.md` and the routes.

Wait for both to finish before going on.

**Step 2 - depends on step 1.** Take the "Untested paths" list from the `code-reviewer` result. If it isn't "none", pass exactly that list to the `test-writer` subagent so it adds those tests and runs `npm test`. If it is "none", skip this step and run `npm test` yourself.

**Step 3 - report.** Combine everything into one report:

```
# Quality gate: PASS | FAIL
## Review findings      (from code-reviewer, high first)
## Docs mismatches      (from docs-checker)
## Tests added          (from test-writer)
## Test result
## Fix before the PR    (numbered, most important first)
```

The gate is FAIL if there is any high finding, any docs mismatch, or any failing test.
