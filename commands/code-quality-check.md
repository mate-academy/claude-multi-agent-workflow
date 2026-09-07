---
description: Audit course-api for convention drift and missing tests, then fix what's safe to fix and verify with the test suite.
---

Run a full code-quality sweep of `course-api`:

1. **Parallel step** — at the same time, do both of the following (they're independent and the next step needs both):
   - Launch the `convention-auditor` subagent against `course-api` (routes, db, and tests) to produce its structured findings checklist.
   - Run `npm test` directly (from `course-api/`) to get the current objective pass/fail baseline, and `npm run lint` if it's quick to include.

2. **Dependent step** — once both of the above have finished, launch the `fix-and-cover` subagent, and give it:
   - the full checklist produced by `convention-auditor`,
   - the `npm test` (and lint) output from step 1,
   so it knows both what to fix and what the baseline test state was before it touched anything.

3. Report back to the user: a summary of the auditor's findings, what `fix-and-cover` fixed vs. left for human review, and the final `npm test` result after its changes. If anything was left for human review, list it clearly with the reason so the user can act on it.

If the user names specific files or a narrower scope (e.g. "just check users.js"), pass that scope through to both subagents instead of the whole `course-api` tree.
