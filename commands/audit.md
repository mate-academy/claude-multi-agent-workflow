---
description: Run the code-quality workflow against course-api — parallel review and checks, then a dependent fix pass.
---

Run a full code-quality audit of `course-api/` using the plugin's subagents. Do this in two stages:

**Stage 1 — parallel.** These two pieces of work don't depend on each other, so start them together and wait for both to finish:
- Dispatch the `code-reviewer` subagent to read through `course-api/routes/`, `course-api/db/store.js`, and `course-api/CLAUDE.md`, and report a findings list of bugs, missing validation, wrong status codes, and any convention violations.
- At the same time, run `npm test` and `npm run lint` inside `course-api/` directly, to get the current objective pass/fail signal (failing tests, lint errors).

**Stage 2 — dependent.** This stage needs the output of Stage 1, so only start it once both parts above have returned:
- Combine the reviewer's findings with any failing tests or lint errors from Stage 1 into one list of concrete issues.
- If the list is non-empty, dispatch the `code-fixer` subagent with that combined list and ask it to resolve each issue, verifying with `npm test` and `npm run lint` after its edits.
- If the list is empty, skip straight to reporting — there's nothing to fix.

**Finish** by reporting one summary to the user: what the review and checks found, what the fixer changed (if anything), and the final `npm test` / `npm run lint` status.
