---
description: Review course-api route files for convention violations and backfill missing test coverage.
---

# /check

Run the code-quality workflow against `course-api/`.

1. **Review, in parallel.** Identify the Express route files under `course-api/routes/` that are relevant (either the files the user named, or — if none were named — every file in `course-api/routes/`). Launch the `api-reviewer` subagent once per route file, all at the same time, each one scoped to just that file plus `course-api/db/store.js` for context. Wait for every review to finish before continuing.

2. **Write tests, after reviews finish.** Combine the findings from every `api-reviewer` run into one list. Launch the `api-test-writer` subagent once, passing it the combined findings plus the full set of route files that were reviewed. It must run after step 1 completes, since it needs the findings to know what coverage is missing.

3. **Report.** Summarize the outcome for the user:
   - Findings from each reviewed file, grouped by file
   - What `api-test-writer` changed and why
   - The final `npm test` result

If `course-api/` doesn't exist in the current working directory, stop and tell the user this command must be run from the repo root.
