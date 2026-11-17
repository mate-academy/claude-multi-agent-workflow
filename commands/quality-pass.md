---
description: Run the full quality workflow (review and test-gap analysis in parallel, then targeted tests, then a test run) on changed or named route files
argument-hint: "[route files, e.g. routes/users.js; default: changed files vs main]"
allowed-tools: Agent, Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(npm test), Bash(npm run lint)
---

Run a quality pass on this Express API using the `api-quality` subagents. Follow these steps in order, and don't skip or merge them.

## Step 1: Decide the scope (you, the main session)
- If arguments were given, the scope is: `$ARGUMENTS`.
- Otherwise, use `git diff --name-only main...HEAD` plus `git status --short` to find changed route and store files. If nothing has changed, use every file in `routes/`.
- Work from the directory that contains the API's `package.json`. State the scope in one line before continuing.

## Step 2: Review and map gaps (PARALLEL)
These two jobs are independent: one judges whether the code is correct, the other maps which code paths have tests. Launch both subagents **in the same message** so they run at the same time:
- `reviewer`: pass it the scope files, plus the diff if there is one.
- `test-gap-finder`: pass it the same route files.

Wait for both to finish before continuing.

## Step 3: Write the missing tests (DEPENDS ON STEP 2)
Launch `test-writer` with **both** results: the gap table from `test-gap-finder` and the findings from `reviewer`. It needs the gaps to know what to test, and the findings so it records known bugs as `test.todo` instead of locking them in with passing tests. If the gap table has no gaps, skip this step and say so.

## Step 4: Verify (DEPENDS ON STEP 3)
Run `npm test` and `npm run lint` yourself; the test-writer can't run commands.
- If a *new* test fails because the test itself is wrong, launch `test-writer` once more with the failure output to fix it. Do this at most once.
- If a new test fails because the app is wrong, leave the app alone. Report it as a bug.

## Step 5: Report
Reply with:
1. **Scope**: files checked.
2. **Review**: the reviewer's findings (high → low) and its verdict.
3. **Coverage**: gaps found, and how many were closed by new tests.
4. **Tests**: tests added, todos recorded, and the final `npm test` / `npm run lint` result.
5. **Next step**: one sentence on what to fix first.

Don't change application code in this workflow; it only reviews and adds tests.
