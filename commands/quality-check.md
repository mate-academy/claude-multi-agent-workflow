---
description: Run a full code-quality pass on a file or route — parallel review and test writing, then lint and test verification, then one combined report.
argument-hint: <path to file or directory, e.g. course-api/routes/users.js>
allowed-tools: Task, Read, Grep, Glob, Bash
---

Run a code-quality workflow on: **$ARGUMENTS**

If `$ARGUMENTS` is empty, run `git diff --name-only` yourself and use those files as the target (the reviewer cannot run git, so pass it explicit paths). If there are none, ask which path to check and stop.

## Step 1 — Parallel (independent work)

In a **single message**, launch both subagents at the same time with the Task tool:

1. `code-quality:code-reviewer` — review `$ARGUMENTS` for bugs, validation gaps, security and maintainability issues. Ask for its findings as `file:line` entries plus a verdict.
2. `code-quality:test-writer` — add or improve tests under `tests/` for `$ARGUMENTS` (happy path, validation errors, not-found). Ask for the files changed and the `npm test` result.

Do not wait for one before starting the other: neither depends on the other's output.

## Step 2 — Dependent (needs both results from Step 1)

Only after **both** subagents have returned:

1. From the API directory (`course-api/`), run `npm run lint` and `npm test`.
2. Cross-check: does any reviewer finding point at behavior the new tests do not cover? List those gaps.
3. If lint or tests fail, report the failure output verbatim — do not fix application code in this command.

## Step 3 — Final report

Return a single report with these sections:

- **Review verdict** — the reviewer's verdict and its top findings, most severe first.
- **Tests** — files created or changed, and the final pass/fail counts.
- **Lint** — clean, or the errors found.
- **Gaps** — reviewer findings not covered by tests.
- **Next actions** — a short, ordered list of what to fix first.
