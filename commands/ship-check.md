---
description: Run the code-quality workflow on course-api before shipping — review, then fix and verify.
---

Run a two-stage code-quality workflow against `course-api/`:

**Stage 1 — parallel.** At the same time, in parallel:
- Launch the `code-quality:code-reviewer` subagent to review the currently changed files (or the whole of `routes/` and `db/store.js` if nothing is changed) for bugs, missing validation, and convention violations.
- Independently run `npm test` and `npm run lint` inside `course-api/` to get the current pass/fail baseline.

Wait for both to finish before moving on.

**Stage 2 — dependent.** Using the findings from Stage 1 (the reviewer's list plus any failing tests or lint errors), launch the `code-quality:test-writer` subagent to fix each issue and add any missing test coverage it identifies. This stage depends on Stage 1's output — do not start it until both parallel tasks have returned.

Finish by reporting: what the reviewer found, what test-writer changed, and the final `npm test` / `npm run lint` result.
