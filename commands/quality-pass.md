---
description: Run the full quality workflow (review and test-gap analysis in parallel, then targeted tests, then a test run) on changed or named route files
argument-hint: "[route files, e.g. routes/users.js; default: changed files vs main]"
allowed-tools: Agent, Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(npm test), Bash(npm run lint), Bash(npm --prefix * test), Bash(npm --prefix * run lint)
---

Run a quality pass on this Express API using the `api-quality` subagents. Follow these steps in order, and don't skip or merge them.

## Step 1: Decide the scope (you, the main session)
- If arguments were given, the scope is: `$ARGUMENTS`.
- Otherwise, use `git diff --name-only main...HEAD` plus `git status --short` to find changed route and store files. If nothing has changed, use every file in the API's `routes/` folder.
- Determine the API directory: the folder containing the `package.json` that owns the routes in scope (e.g. `course-api/` when the API lives in a subfolder, `.` when `package.json` is at the repository root). Don't `cd`; refer to files by their path from where you are running (e.g. `course-api/routes/users.js`), and if a path given in the arguments doesn't exist as written, resolve it inside the API directory.
- State the scope and the API directory in one line before continuing.

## Step 2: Review and map gaps (PARALLEL)
These two jobs are independent: one judges whether the code is correct, the other maps which code paths have tests. Launch both subagents **in the same message** so they run at the same time:
- `api-quality:reviewer`: pass it the scope files (paths as resolved in step 1), plus the diff if there is one.
- `api-quality:test-gap-finder`: pass it the same route files and the API directory (its tests are in `<api-dir>/tests/`).

Wait for both to finish before continuing.

## Step 3: Write the missing tests (DEPENDS ON STEP 2)
Launch `api-quality:test-writer` with the API directory (new tests go in `<api-dir>/tests/`) and **both** results: the gap table from `api-quality:test-gap-finder` and the findings from `api-quality:reviewer`. It needs the gaps to know what to test, and the findings so it records known bugs as `test.todo` instead of locking them in with passing tests. If the gap table has no gaps, skip this step and say so.

## Step 4: Verify (DEPENDS ON STEP 3)
Run `npm --prefix <api-dir> test` and `npm --prefix <api-dir> run lint` yourself, with `<api-dir>` from step 1 (plain `npm test` / `npm run lint` when it is `.`); the test-writer can't run commands.
- If a *new* test fails because the test itself is wrong, launch `api-quality:test-writer` once more with the failure output to fix it, then run both checks again the same way. Do this at most once.
- If a new test fails because the app is wrong, leave the app alone. Report it as a bug.

## Step 5: Report
Reply with:
1. **Scope**: files checked.
2. **Review**: the reviewer's findings (high → low) and its verdict.
3. **Coverage**: gaps found, and how many were closed by new tests.
4. **Tests**: tests added, todos recorded, and the final `npm test` / `npm run lint` result.
5. **Next step**: one sentence on what to fix first.

Don't change application code in this workflow; it only reviews and adds tests.
