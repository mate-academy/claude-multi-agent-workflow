---
description: Run the full API quality workflow — review the API in parallel, then write tests targeting what the review found.
---

Run the api-quality-guard workflow against the Express API in `course-api/`.

1. **Scope the work.** Look at `course-api/routes/` and list the route files present (e.g. `health.js`, `users.js`) plus any middleware or db-access modules they touch.

2. **Parallel step — review everything at once.** Launch one `api-reviewer` subagent per route file found in step 1, all at the same time, each scoped to a single file (and the middleware/db modules that file calls into). These reviews are independent of each other, so do not run them one after another — start them together and wait for all of them to finish.

3. **Merge the findings.** Once every `api-reviewer` run has returned, combine their findings into a single list. Drop duplicates (the same issue can surface from two reviewers if they both touch shared middleware). Note which files have zero findings.

4. **Dependent step — write tests from the findings.** Only after the merged findings list exists, launch a single `test-writer` subagent. Give it the merged findings as input and ask it to prioritize regression tests for whatever the review flagged (missing validation, unhandled errors, inconsistent responses) in addition to normal happy-path coverage. This step must wait for step 3 — it needs the findings to know what to target.

5. **Report.** Summarize: what each `api-reviewer` found (or didn't), what tests `test-writer` added or changed, and the resulting test run outcome.
