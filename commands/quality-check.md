---
description: Review course-api's routes for convention adherence and bring their tests up to date with what the review finds.
---

Run the code-quality workflow against `course-api/`:

1. **Parallel review step.** Launch the `api-reviewer` subagent twice at once, in parallel: once against `routes/users.js` together with `db/store.js`, and once against `routes/health.js`. These are independent files, so both reviews should run concurrently rather than one after the other. Wait for both to finish.

2. **Dependent test step.** Once both reviews are back, combine their findings into a single list. Launch the `test-writer` subagent one time with that combined list, asking it to add or update tests in `course-api/tests/` so every `should-fix` and `blocker` finding has a corresponding test case (skip `nit`-level findings unless they're trivial to cover). This step must wait for step 1 — it needs the findings before it can decide what to test.

3. **Report.** Summarize for the user: what the reviewers found (grouped by severity), which tests were added or changed as a result, and confirm the command to run them (`npm test` from `course-api/`). If a `blocker` finding wasn't addressed by a test, call that out explicitly rather than letting it pass silently.
