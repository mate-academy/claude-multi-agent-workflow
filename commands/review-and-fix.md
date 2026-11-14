---
description: Review code with two parallel reviewers, then propose fixes for every finding
argument-hint: "[path to review, default: course-api]"
---

Run the qa-kit review-and-fix workflow on: $ARGUMENTS
If no path was given, use `course-api`.

## Step 1 — Prepare (sequential)
1. Load the `qa-kit:review-checklist` skill. You will pass its severity rubric to both reviewers.
2. Use Glob to list the source files under the target path (skip `node_modules/`, `tests/`, and generated files). Split them into two groups of roughly equal size:
   - **Group A — request handling:** route/controller files (e.g. `routes/`).
   - **Group B — everything else:** entry point, data layer, and helpers (e.g. `server.js`, `db/`).
   If a group would be empty, split the file list in half instead.

## Step 2 — Review (parallel)
In a **single message**, launch two `code-reviewer` subagents at the same time — one for Group A, one for Group B. Give each:
- its exact file list,
- the severity rubric from the skill,
- the instruction to return findings in its standard High / Medium / Low format.

Do not start Step 3 until **both** reviewers have returned.

## Step 3 — Merge (depends on Step 2)
Combine both reports into one list grouped by High / Medium / Low. Remove duplicates (same file and line). Show the merged review to the user.

If there are no findings at all, stop here and tell the user the code is clean.

## Step 4 — Propose fixes (depends on Step 3)
Launch one `code-fixer` subagent with the merged findings and the target path. It writes `REVIEW-FIXES.md` at the root of the target path.

## Step 5 — Report
Tell the user:
- how many findings each reviewer returned, and the merged count per severity;
- the path of `REVIEW-FIXES.md` and the fixer's summary;
- that no source files were changed — the fixes are proposals to review and apply.
