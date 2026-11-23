---
description: Run the API quality workflow - two reviewers in parallel, then a test writer, then tests and lint
argument-hint: "[api-folder, default: course-api]"
allowed-tools: Read, Grep, Glob, Bash(npm test:*), Bash(npm run lint:*)
---

Run the API quality workflow on the API folder `$ARGUMENTS`. If that is empty, use `course-api`. Call this folder `<api>` below.

Use the three subagents of this plugin by name. Do the steps in this exact order. Do not edit any file yourself: only `api-quality-kit:test-writer` may write, and only inside `<api>/tests/`.

## Step 1 - in parallel
The two reviewers do not depend on each other, so start both in a single message, as two subagent calls at the same time:
- `api-quality-kit:api-reviewer`: review the code in `<api>`. Tell it which folder to use.
- `api-quality-kit:docs-checker`: compare `<api>/docs/api.md` with the routes in `<api>`. Tell it which folder to use.

Wait until both have finished and you have both reports.

## Step 2 - depends on step 1
Start `api-quality-kit:test-writer` only after both reports are back. It needs them. Give it the folder `<api>` and paste the full text of both reports into its prompt. Ask it to cover the "Behaviors that need tests" list and the mismatches, and to mark known bugs as to-do tests.

## Step 3 - depends on step 2
After the test writer has finished, run `npm test --prefix <api>` and then `npm run lint --prefix <api>`. Run them one after the other, not together. If something fails, report it. Do not fix application code.

## Final report
Reply with these four short sections:
1. **Review**: the findings of `api-reviewer`, with the severity of each.
2. **Docs**: the mismatches from `docs-checker`, or "no mismatches".
3. **Tests**: the files and tests that `test-writer` added, and which are to-do tests for bugs.
4. **Checks**: the result of the tests and of lint, with the numbers.

Do not claim that anything passed unless you saw the command output.
