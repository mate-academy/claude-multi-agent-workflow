---
description: Review an API, audit its docs contract, then write regression tests for everything both turned up.
argument-hint: [path to the API — defaults to course-api/]
---

# Harden the API

Target: `$ARGUMENTS` — if that is empty, target `course-api/`.

Run the three `api-quality` subagents as a workflow. The first two are
independent of each other and must run **at the same time**; the third depends
on both and must wait.

## Step 1 — inspect the target (you, quickly)

Before spawning anything, list the target's route files, its data-store module,
its docs, and its test files. You need this so each subagent gets a concrete
starting point instead of a vague brief. Do not review the code yourself — that
is the subagents' job.

## Step 2 — review and audit, in parallel

Spawn **both** of these in a **single message**, so they run concurrently. They
read the same files but answer different questions, and neither one's output
feeds the other — running them in sequence would only make the command slower.

- **`api-reviewer`** — give it the route files and the store module. Ask for its
  correctness review, and tell it you specifically need its `## Test gaps`
  section for the next step.
- **`contract-auditor`** — give it the docs reference, the project's conventions
  file, and the entry point. Ask for its drift and convention-break report.

Wait for both to come back before going further. Do not start step 3 with only
one result in hand.

## Step 3 — write the tests (depends on step 2)

This step **must not start until both reports are in**, because its input is the
union of the two: `api-reviewer`'s test gaps plus every `high`-severity row in
`contract-auditor`'s drift table. That merged list does not exist until both
agents have finished, which is exactly why this step is sequential.

Merge the two reports yourself first:

- drop duplicates — both agents often land on the same missing `404`;
- drop anything the existing suite already covers;
- order what is left most severe first.

Then spawn **`test-author`** once, with that merged list as its brief — each
item as a one-line finding with its `file:line`. Tell it to write the tests, run
the suite, and report which failures are real defects.

## Step 4 — report back

Print one summary, in this order:

1. **Verdict** — one line: is this API safe to ship as-is, or not, and why.
2. **Confirmed defects** — the findings that `test-author` now has a failing
   test for. These are proven, not suspected. Give the `file:line` and the
   failing assertion for each.
3. **Reported but untested** — findings from step 2 that never got a test, each
   with the reason.
4. **Docs drift** — the contract-auditor rows that need a docs edit rather than
   a code fix.
5. **Suggested next command** — the single most valuable fix to make first.

Do not fix any of the defects. This command's job is to find them, prove them
with tests, and hand the list back. Fixing is a separate, deliberate step the
user asks for.
