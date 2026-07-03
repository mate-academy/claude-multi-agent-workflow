---
description: Full code-quality pass — two reviewers in parallel, then tests written for the gaps they found
argument-hint: [path to review, defaults to the whole project]
---

Run the code quality workflow on $ARGUMENTS. If no path was given, run it on the project's source code (skip dependencies, lockfiles, and generated files).

## Step 1 — Review in parallel

Split the target code into two independent slices — for a typical API project: the interface layer (routes/endpoints/handlers) and the core layer (data access, business logic, app setup). Then launch **two code-reviewer subagents at the same time, in a single message**, one per slice. Each gets its slice's file list and must return its verdict, findings, and test gaps.

Do not start either reviewer after the other — they are independent and must run concurrently.

## Step 2 — Merge the reviews (waits for Step 1)

Once **both** reviewers have returned:

- Combine their findings into one list, deduplicated, ordered most severe first.
- Combine their test-gap lists into a single list of untested behaviors.

## Step 3 — Write the missing tests (depends on Step 2)

Launch **one test-writer subagent** and hand it the merged test-gap list from Step 2. This step cannot start earlier — its input is the reviewers' output. The test-writer writes tests in the project's existing style, runs the suite, and reports results.

## Step 4 — Final report

Present to the user:

1. **Review verdict** — the combined verdict and the deduplicated findings list with file:line references.
2. **New coverage** — the tests that were added and the suite result.
3. **Bugs exposed** — any failing test the test-writer flagged as a real defect, called out prominently.
4. **Suggested next step** — fix the top finding, or ship if everything is clean.
