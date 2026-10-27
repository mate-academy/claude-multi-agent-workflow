---
description: Run the quality crew on an Express API — parallel reviews, then tests for the findings, then a final report
argument-hint: "[api folder, default course-api]"
---

Run a code-quality workflow on the Express API in `$ARGUMENTS`
(if no argument was given, use `course-api`).

Step 1 — Find the targets.
List the route files in `<api>/routes/` plus `<api>/db/store.js`.

Step 2 — Review in PARALLEL.
Launch one `api-reviewer` subagent per file found in Step 1, all at the same
time in a single turn. These reviews are independent, so do not wait for one
before starting the next. Give each reviewer only its own file path.

Step 3 — Write tests (DEPENDS on Step 2).
Wait until every reviewer has finished. Collect all their "Untested behaviour"
items into one list, removing duplicates. Then launch ONE `test-writer`
subagent and give it that exact list plus the API folder. It must not search
for new behaviours on its own — only cover the list it receives.

Step 4 — Report (DEPENDS on Step 3).
After the test-writer finishes, run `npm test` in the API folder yourself and
reply in Spanish with:

1. **Resumen**: one sentence.
2. **Hallazgos por severidad**: 🔴 / 🟡 / 🟢, merged from all reviewers, with file:line.
3. **Pruebas nuevas**: files created and how many pass / fail.
4. **Bugs confirmados**: findings that now have a failing test.
5. **Siguiente paso**: one line.

Do not change application code in this workflow.
