---
description: Run a full quality pass on an Express API - review and coverage scouting in parallel, then write the missing tests.
argument-hint: [path to the API folder, default course-api]
---
Run a quality pass on the Express API in `$ARGUMENTS` (if that is empty, use `course-api/`). Tell each subagent which folder to work in. Follow these steps in order.

## Step 1 - in parallel
The two jobs below are independent: neither needs the other's output. Launch BOTH subagents in a single message, as two Agent tool calls made together, so they run at the same time.

- `api-reviewer` - review every route and the data store against the API's conventions.
- `coverage-scout` - map which endpoints and error paths have tests and which do not.

## Step 2 - wait, then run in sequence
Do not start this step until BOTH results from step 1 are back, because it needs them. Launch `test-writer` and give it:
- the scout's GAPS list, and
- the reviewer's findings marked `[behaviour]`, so it can write `todo` tests for them.

If the scout reported no gaps and the reviewer reported no `[behaviour]` findings, skip this step and say so.

## Step 3 - report
When `test-writer` returns, do not launch anything else. Confirm its result by running `npm test` and `npm run lint` yourself in the API folder, then give the user one short report:
1. Reviewer findings, grouped High / Medium / Low.
2. Gaps found, and which tests were added (passing vs `todo`).
3. The real `npm test` and `npm run lint` results.
4. What is left for the user to fix - the code itself was not changed.
