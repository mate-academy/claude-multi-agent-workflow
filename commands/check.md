---
description: Run the quality-gate workflow (parallel review and test-gap analysis, then fill the gaps with tests) on an API project
argument-hint: "[project directory — defaults to the current directory]"
---

Run the quality-gate workflow on the project at `$ARGUMENTS` (use the current directory if it's empty). Call this directory TARGET and pass it explicitly to every subagent.

Run the steps in this order. Don't skip ahead, and don't do a subagent's job yourself.

## Step 1: analyse (in parallel)

Start these two subagents **in the same turn, in parallel**. They're both read-only and don't depend on each other:

- **`code-reviewer`**: "Review the application code in TARGET (server.js, routes/, db/) against the project's conventions."
- **`coverage-mapper`**: "Map every endpoint in TARGET to its tests and list the missing cases."

Wait until **both** have returned before going on.

## Step 2: fill the gaps (depends on step 1)

This step needs step 1's output, so it runs only after both analysts have finished.

- If `coverage-mapper` reported no missing cases, skip this step and say so.
- Otherwise, start **`test-writer`** with TARGET and the **"Missing cases" list from `coverage-mapper`, word for word**. Also pass any `code-reviewer` findings that describe current behaviour a test should pin down. Tell it not to write tests for the reviewer's bugs, because those would fail until the bug is fixed.

## Step 3: report

When `test-writer` has returned (or step 2 was skipped), write one combined report:

```
# Quality gate: <TARGET>
## Verdict: PASS | NEEDS WORK
(PASS = no High review findings, and npm test is green after step 2)
## Review findings      ← code-reviewer output, grouped by severity
## Coverage             ← coverage-mapper table, before step 2
## Tests added          ← test-writer output
## Next steps           ← at most 3 bullets, most important first
```

Don't fix the reviewer's findings yourself. This command reports and adds tests; changing application code is left to the user.
