---
name: quality-gate
description: Run before committing or opening a PR — runs the project's lint and test scripts, summarizes pass/fail, and lists exactly what needs fixing. Use when the user asks "is this ready to commit/merge?", "run the checks", or "quality gate".
---

Check whether the current changes are ready to ship.

1. Find the nearest `package.json` to the changed files (use `git status`/`git diff --name-only` to see what changed). Read its `scripts` for `lint` and `test` entries — don't assume names, use what's actually defined.
2. Run the lint script. Report every error and warning with file:line.
3. Run the test script. Report pass/fail counts and the name and reason for any failing test.
4. Give a one-line verdict: **ready to commit** (lint clean, tests pass) or **not ready** (with the specific blockers to fix, ordered by how likely they are to cascade — e.g. a lint syntax error before a downstream test failure it's causing).

Do not fix issues yourself unless the user asks you to — this skill reports status, it doesn't make changes.
