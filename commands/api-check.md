---
description: Review course-api changes against conventions and docs, then fill any test gaps and confirm they pass.
---

Run the api-guard workflow against `course-api/`.

**Step 1 — parallel.** In the same turn, launch two separate dispatches of the `api-reviewer` subagent at once, since they're independent work over different inputs:
- Call A: review every file under `course-api/routes/` and `course-api/db/store.js` for violations of the project's documented conventions (validation status codes, error shape, store-only data access, one file per resource).
- Call B: compare `course-api/docs/api.md` against the live routes and report any drift between the documentation and the actual code.

Wait for both calls to finish before moving on.

**Step 2 — dependent on Step 1.** Merge the findings from Call A and Call B into one list. Launch the `test-writer` subagent with that merged list and ask it to add or update tests in `course-api/tests/` covering any gaps the findings surfaced, then run `npm test --prefix course-api` itself to confirm they pass.

**Step 3.** Report a combined summary to the user: the findings from Step 1 (grouped by Call A / Call B), the tests added or changed in Step 2, and the final pass/fail result.
