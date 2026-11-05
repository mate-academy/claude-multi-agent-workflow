# NOTES — code-quality plugin

## What it does and how to install

`code-quality` runs a multi-agent quality pass on an Express API: a read-only reviewer and a test writer work in parallel, then lint and tests verify the result. It also ships a route-conventions skill and a hook that lints every `.js` file Claude edits.

```
/plugin marketplace add akennich/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
/code-quality:quality-check course-api/routes/users.js
```

Locally from a clone: `claude --plugin-dir .`.

## Scoping decision: the two subagents

`code-reviewer` gets `Read, Grep, Glob, Bash` and **no** `Edit`/`Write`: a reviewer that can't modify files can't "fix" things silently, so its report stays an honest second opinion. It runs on `sonnet` because spotting bugs and security issues needs judgment.

`test-writer` gets `Edit` and `Write` plus `Bash` (to run `npm test`) and runs on `haiku`: writing tests means copying the style of existing tests, a pattern-following job that doesn't need the most capable model. Its prompt confines edits to `tests/`, so application bugs are reported rather than patched.

## Orchestration decision: parallel vs sequential

Step 1 runs `code-reviewer` and `test-writer` **in parallel** because neither needs the other's output: both only read the same target code. Running them together halves the wait.

Step 2 (lint + `npm test`, then the coverage cross-check) runs **after** both finish, because it depends on both results: the tests must exist before they can be run, and the gap analysis compares reviewer findings against the new tests. Running it earlier would verify stale code or compare against nothing.
