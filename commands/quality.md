---
description: Run the full code-quality workflow against an Express route or path — review, lint, and regression tests, in one pass.
argument-hint: [path]
---

Run the code-quality workflow against `$ARGUMENTS` (default to `course-api/routes/` if no
path is given).

**Step 1 — parallel.** In a single message, do both of the following at once, since they
read independent sources and neither depends on the other's output:
- Launch the `api-reviewer` subagent on `$ARGUMENTS` to get a numbered list of findings.
- Run `cd course-api && npm run lint` yourself via Bash to get ESLint's output.

**Step 2 — dependent.** Wait for both of the above to finish. Merge the reviewer's findings
with the ESLint output into a single ranked list (highest severity first), dropping any
duplicate issues that both sources flagged.

**Step 3 — dependent.** Hand the merged list to the `test-author` subagent. It cannot start
until step 2's merged list exists, since that list is its input. Ask it to write regression
tests for the behavioural findings (skip pure style/lint nits — those don't need tests) and
run `npm test` in `course-api/`.

**Step 4 — report.** Summarize: how many findings were found, how many tests were added and
where, and the final test suite result (pass/fail).
