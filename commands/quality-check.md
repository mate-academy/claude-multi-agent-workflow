---
description: Run the full code-quality workflow on course-api/ — parallel review + baseline check, then a dependent fix-and-verify pass.
---

Run a code-quality pass over `course-api/` as a workflow:

**Step 1 (parallel — run these two at the same time, they don't depend on each other):**
- Launch the `code-reviewer` subagent to review `course-api/routes/` and
  `course-api/db/store.js` for bugs, missing validation, and missed
  not-found handling.
- At the same time, run `npm test` and `npm run lint` inside `course-api/` to
  get the current baseline (what's already failing vs. already clean).

**Step 2 (dependent — only start once both parts of step 1 have finished):**
- Combine the `code-reviewer` findings with the baseline test/lint output.
- If there is anything to fix, launch the `code-fixer` subagent with that
  combined list so it applies fixes and re-runs `npm test` /
  `npm run lint` itself to confirm.
- If step 1 turned up nothing (clean review, green tests, clean lint), skip
  `code-fixer` entirely and say so — don't invent work for it.

**Step 3 (final report):**
Summarize: what the review found, what the baseline was, what `code-fixer`
changed (if anything), and the final `npm test` / `npm run lint` result.
