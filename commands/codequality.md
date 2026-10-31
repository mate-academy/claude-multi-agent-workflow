---
description: Run a code quality workflow. Reviews code and investigates failing tests in parallel, then fixes issues and reports.
argument-hint: [path or area to focus on, optional]
---

Run a code quality workflow using the `code-reviewer` and `test-fixer` subagents.

**Scope:** $ARGUMENTS

If no scope was given, use the whole project: `course-api/` when it exists, otherwise the repository root. Tell both subagents the scope and the test command to use (check `package.json` scripts or the project's CLAUDE.md).

## Stage 1: Parallel (independent work)

These two jobs do not depend on each other. Launch **both subagents in a single message** so they run at the same time. Do not wait for one before starting the other.

1. **Review task** — use the `code-reviewer` subagent. Ask it to review the scope for bugs, security issues, maintainability and code quality, and to return findings with file paths, line references, severity and recommended fixes.
2. **Test investigation task** — use the `test-fixer` subagent in **diagnose-only mode**. Tell it explicitly: run the tests, and for any failure find the root cause, but do **not** edit or create any files. It should return the test command used, the pass/fail results, each failing test with its root cause, and the fix it would make.

## Checkpoint

Wait until **both** Stage 1 results are back. Do not start Stage 2 early. Briefly note the key points of each result. If the tests all pass and the review found nothing worth fixing, skip Stage 2 and go straight to the final report.

## Stage 2: Sequential (depends on Stage 1)

Now use the `test-fixer` subagent again, this time to **implement fixes**. Give it everything it needs, because it cannot see Stage 1 on its own:

- the full review findings from `code-reviewer`
- the full test investigation findings, including the root causes
- the scope

Ask it to:

1. Fix the failing tests at their root cause, starting with the test investigation findings.
2. Apply review findings that are Critical or High severity, or that are small and clearly safe. Leave anything risky or ambiguous alone and report it as unresolved.
3. Not delete, skip or weaken any test to make it pass.
4. Run the relevant tests after its changes, and the full test suite at the end.
5. Return a summary of changes, files modified, tests run and remaining issues.

## Final report

When Stage 2 finishes, give the user one report with these sections:

- **Review findings** — grouped by severity, with file and line references.
- **Test investigation** — failures found and their root causes (or "all tests passing").
- **Fixes applied** — what was changed and why.
- **Files changed** — a list of paths.
- **Tests run** — commands and results, before and after.
- **Unresolved issues** — review findings not fixed, remaining failures, and suggested follow-ups.

Do not commit anything. Leave the changes for the user to review.
