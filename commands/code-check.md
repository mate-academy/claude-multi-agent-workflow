---
description: Run the code-quality workflow on course-api — parallel review, then a dependent fix pass, then a final verification.
argument-hint: "[path to review, defaults to course-api/]"
---

Run the full code-quality workflow against `course-api/` (or against $ARGUMENTS if given a specific path).

## Step 1 — Parallel review

Launch the `code-reviewer` subagent **twice at once, in parallel**, since the two areas don't depend on each other:
- one instance reviewing everything under `course-api/routes/`
- one instance reviewing `course-api/db/store.js` together with `course-api/server.js`

Both are read-only and independent, so start them together and wait for both to finish before moving on.

## Step 2 — Combine findings (dependent on Step 1)

Once — and only once — both parallel reviews have returned, merge their findings into a single de-duplicated list, ordered by severity. This step cannot start until Step 1 is fully done, since it needs both results.

## Step 3 — Fix pass (dependent on Step 2)

Launch the `code-fixer` subagent **once**, passing it the combined findings list from Step 2. It should apply the fixes directly in `course-api/` and run `npm run lint` and `npm test` there to confirm nothing broke. This step must wait for Step 2's combined list — it should not start from a partial or single-reviewer set of findings.

## Step 4 — Final report

Summarize for the user: what each parallel review found, what the fixer changed, and the final lint/test result. Call out anything the fixer could not resolve.
