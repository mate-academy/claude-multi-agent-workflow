---
description: Run a full code-quality sweep of an Express API — two reviews in parallel, then tests written from their combined findings.
argument-hint: [path to the API folder, defaults to course-api]
allowed-tools: Task, Read, Grep, Glob, Bash(npm test:*), Bash(npm run lint:*)
---

# Quality sweep

Run a complete quality pass over an Express API using this plugin's subagents.

**Target folder** — `$ARGUMENTS` if the user gave one, otherwise `course-api`.
If that folder does not exist, stop and say so instead of guessing at another one.

Do not review or write any code yourself. Your job is orchestration — dispatch
the subagents, combine what they return, and report. The whole sweep is
read-mostly except for the tests the last step adds.

## Step 0 — orient

Read the target folder's `CLAUDE.md` and `package.json`. You need two things
from them: the conventions the reviewers will be held to, and the exact test and
lint commands this project uses. Do not assume `npm test` — read it.

## Step 1 — two reviews, in parallel

Launch **both** of these `api-reviewer` subagents **in a single message**, so
they run at the same time. Sending them one after another wastes wall-clock
time for no benefit — neither review reads the other's output, so nothing is
gained by ordering them.

- **Reviewer A — the request path.** Scope - every file in `routes/` plus
  `server.js`. Tell it to focus on status codes, input validation, error-shape
  consistency, and any route that holds state instead of going through the store.
- **Reviewer B — the data and contract path.** Scope - `db/store.js`, `docs/`,
  and `tests/`. Tell it to focus on the store's own correctness, on places where
  the documentation describes behaviour the code does not implement, and on
  behaviours the existing tests never exercise.

Give each reviewer the conventions you read in Step 0 and the exact file list
for its scope. Wait for both reports before doing anything else.

## Step 2 — merge the findings (depends on Step 1)

This step cannot start until **both** reviewers have returned, because its input
is their combined output.

1. Collect every finding from both reports into one list.
2. Drop exact duplicates — the same problem in the same file and line, found by
   both reviewers, is one finding.
3. If the two reports disagree about the same code, keep both and mark the
   disagreement rather than silently picking a side.
4. Sort by severity — `high`, then `medium`, then `low`.
5. Keep the findings that a test could actually catch. A naming or formatting
   nit is real, but no test will ever assert on it — carry those to the final
   report without sending them onward.

## Step 3 — write the tests (depends on Step 2)

Launch **one** `test-author` subagent. This step is strictly sequential — it
needs the merged, deduplicated list from Step 2 as its input, so it cannot run
alongside Step 1.

Hand it:

- the testable findings, highest severity first;
- the exact path of the test folder and the test and lint commands from Step 0;
- the explicit instruction that it may write only inside the test folder, and
  that a test which fails because the production code is genuinely broken is a
  correct outcome to report, not something to paper over.

## Step 4 — report to the user

Print one summary, in this order:

1. **Verdict** — one sentence on whether the API is safe to ship as is.
2. **Findings** — the merged table, severity first, each with `file:line`.
3. **Tests added** — what `test-author` wrote and whether the suite is green.
4. **Real defects found** — any test that fails because the code is wrong. Name
   the file and what a human needs to decide. Never fix these silently here.
5. **Not covered** — findings no test was written for, and why.

If any subagent returned nothing usable, say which one and what is missing.
Never present a suite as passing unless `test-author` reported an actual run.
