---
description: Review course-api's existing routes, then scaffold and re-review a new resource if asked for one.
---

Run the code-quality workflow for `course-api`:

1. **Parallel step** — At the same time, launch the `api-reviewer` subagent once for `routes/users.js` and once for `routes/health.js`. Wait for both reviews to finish before moving on. These are independent files, so there's no reason to review them one after another.

2. **Dependent step** — If the user asked for a new resource/endpoint (or the reviews above surfaced a missing route worth adding), run the `route-scaffolder` subagent to generate it. This step depends on step 1 completing first, because the scaffolder should follow the same conventions the reviewer just confirmed (or flagged as violated) in the existing routes.

3. **Dependent step** — Once `route-scaffolder` finishes, run `api-reviewer` again, this time against the newly generated route file, to confirm the new code meets the same bar as the rest of the codebase. This step depends on step 2 producing a file to review.

4. Summarize for the user: what was reviewed, what (if anything) was scaffolded, and whether the final review passed clean.
