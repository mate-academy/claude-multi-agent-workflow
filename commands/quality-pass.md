---
description: Review an API's routes and docs in parallel, then write regression tests for what the review found and run the suite.
argument-hint: "[path to the API, defaults to course-api/]"
---

Run a full quality pass over the API at `$1`. If `$1` is empty, use `course-api/`.
Call that directory the target from here on.

Do not review, audit, or write tests yourself. Your job is to run the workflow, pass
results between the steps, and write the final summary. All of the actual work
happens in the subagents below.

## Step 0 — Orient (do this first, alone)

Read the target's `package.json` and `CLAUDE.md` so you know the test command and the
project's conventions, and list the files under `routes/`, `db/`, `docs/`, and
`tests/`. If the target has no `routes/` directory, stop and say so — there is
nothing here for this workflow to review.

## Step 1 — Review and audit, in parallel

These two steps look at the same code but do not depend on each other, so run them
**at the same time**: launch both subagents in a single message, with two tool calls,
and wait for both to come back before continuing. Do not run them one after the
other — that just doubles the wall-clock time for no benefit.

- `route-reviewer` — hand it the target path and the list of files under `routes/`
  and `db/`. Ask for its findings report.
- `contract-auditor` — hand it the target path, the doc file under `docs/`, and the
  same route file list. Ask for its mismatch table.

If one of the two fails, keep the other's results and carry on, noting the failure in
the summary.

## Step 2 — Write regression tests (depends on Step 1)

This step **cannot start until both agents in Step 1 have returned**, because what
gets tested is decided by what they found. Once you have both reports:

1. Merge the two lists into one set of findings. Drop duplicates — a wrong status
   code often shows up in both reports, once as a bug and once as doc drift. Order
   them by severity, and drop anything cosmetic.
2. Launch `test-writer` once, with the merged list quoted in full, the target path,
   the existing test files, and the test command from Step 0. Tell it explicitly to
   test only, and to leave routes and the store untouched.
3. Read its report. If it says the suite is red because of a confirmed bug, that is
   a successful outcome for this workflow, not a failure — the test is doing its job.

## Step 3 — Summarise (depends on Step 2)

Write one short report to the user, in this order:

1. **Verdict** — the reviewer's verdict, plus the suite result: green, or red with
   the count of confirmed bugs.
2. **Must fix** — the merged findings that matter, most severe first, each as
   `file:line — what is wrong`, and whether a test now covers it.
3. **Docs** — the auditor's mismatch count and the endpoints involved.
4. **Tests added** — the file and name of each new test.
5. **Next** — the single change you would make first, and which file it is in.

Never claim the suite is green unless the `test-writer` report shows a passing run.
Report the counts you were given rather than re-running the suite yourself.
