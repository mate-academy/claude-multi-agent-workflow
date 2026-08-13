---
description: Run the full api-quality-flow multi-agent workflow — review, test, fix, and re-verify Express API changes in course-api.
argument-hint: [target or scope]
---

# api-quality-flow

Orchestrate the plugin's subagents to review, test, and safely fix Express API changes in `course-api/`.

Target/scope for this run: $ARGUMENTS — if empty, cover the whole `course-api` app.

This workflow has four steps. Steps 1–2 are **parallel**, step 3 is **sequential/dependent** on step 2, and step 4 is a second **sequential/dependent** step that only runs after step 3 finishes. Do not collapse or reorder these — the dependency structure is the point of this command.

## Step 1 — PARALLEL: launch api-reviewer and test-auditor together

Launch both of these agents **at the same time, in parallel**, in a single batch — do not run one and then wait before starting the other:

- **`api-reviewer`** — read-only review of `course-api` (scoped to $ARGUMENTS if given) for bugs, missing validation, wrong HTTP status codes, malformed JSON error shapes, and data-access issues that bypass `db/store.js`.
- **`test-auditor`** — run the `course-api` test suite (`npm test`) and report any failures with concrete evidence (expected vs. actual, file:line, stack trace).

These two agents are independent: static review of the code doesn't need test results, and running the existing test suite doesn't need the review. That independence is exactly why they run in parallel instead of one after another.

## Step 2 — WAIT for both parallel results

Block here until **both** `api-reviewer` and `test-auditor` have returned. Combine their output into one findings set:

- Review findings from `api-reviewer` (bugs, validation, status codes, error shape, data access)
- Test findings from `test-auditor` (failing tests and their evidence)

Do not proceed to step 3 with only one of the two results.

## Step 3 — SEQUENTIAL / DEPENDENT: quality-fixer acts on the combined findings

This step **depends on step 2** and must not start until both parallel results are in hand — `quality-fixer` needs the combined findings as its input, so it cannot run concurrently with step 1.

Pass the full combined findings from step 2 to **`quality-fixer`** and have it:

- Make the smallest safe implementation fixes in `course-api` that address the findings
- Leave anything under `course-api/tests/` untouched
- Run the test suite itself after making changes, as a first check

## Step 4 — SEQUENTIAL / DEPENDENT: final verification with test-auditor

This step **depends on step 3** — it must run only after `quality-fixer` has finished, as an independent second invocation of `test-auditor` used purely to verify the result. It is not part of the parallel step in step 1 and must not be started early.

Run **`test-auditor`** again, fresh, against `course-api` to confirm the fix suite is green and nothing regressed.

## Step 5 — Report the final combined result

Report back to the user:

- What `api-reviewer` found (or that it found nothing)
- What `test-auditor` found on its first run
- What `quality-fixer` changed, and anything it deliberately left unaddressed
- What the final `test-auditor` verification run in step 4 showed (pass/fail counts)
