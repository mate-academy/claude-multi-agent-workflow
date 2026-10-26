---
description: Run the full API quality workflow — parallel review and coverage scan, then targeted tests and a report.
argument-hint: "[path to the API, default: course-api]"
---
Run the api-quality workflow on the Express API in `$ARGUMENTS` (if no path is given, use `course-api`). Tell each subagent the API directory so it reads and runs things there.

**Step 1 — in parallel.** These two jobs are independent, so launch both subagents in a single message and wait for both to finish:
- `api-reviewer`: review the routes, store, and server for bugs and convention breaks.
- `coverage-scout`: list which endpoint + status combinations are and are not covered by tests.

**Step 2 — depends on Step 1.** Only after both have returned, launch `test-writer`. Pass it, word for word, the "Not covered" table from `coverage-scout` and every High and Medium finding (with its `Test idea:` line) from `api-reviewer`. Ask it to write one test per gap and per finding, then run `npm test`.

**Step 3 — report (you, no subagent).** Combine the three results into one short report:
1. **Review findings** — the High / Medium / Low list from `api-reviewer`.
2. **Coverage** — how many gaps were found and how many now have tests.
3. **Tests** — what `test-writer` added and the pass/fail counts.
4. **Likely bugs** — each failing test, linked to the review finding it confirms.
5. **Next steps** — at most three, most important first.

Do not fix application code in this command; it only reports and adds tests.
