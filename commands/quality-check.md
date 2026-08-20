---
description: Run a full code-quality pass over course-api — review, tests, lint — and optionally fix what's found.
---

# Code quality check

Orchestrate a multi-agent quality pass over `course-api/`:

1. **Parallel step.** At the same time:
   - Launch the `code-reviewer` subagent to audit `course-api/` for correctness bugs, missing validation, convention violations, and test-coverage gaps. Collect its findings verbatim — do not summarize away specifics like file/line.
   - Yourself, run `npm test` and `npm run lint` from inside `course-api/` and capture any failures or warnings.
   These two don't depend on each other — the reviewer reads code while tests/lint run against it — so do not wait for one before starting the other.
2. **Dependent step.** Once both finish, merge their output into one ranked list: real bugs first, then missing validation, then failing tests/lint, then coverage gaps or style notes. Present this to the user before changing anything — this step needs both prior results and can't start until they're in.
3. If the user wants fixes applied, launch the `code-fixer` subagent once per distinct issue (or with the full list, if the issues are related) — give it the specific finding from step 2, not just "fix everything." Constrain it to `course-api/`.
4. **Dependent step.** After code-fixer reports back, re-run `npm test` and `npm run lint` yourself to confirm the fixes hold and nothing regressed — this depends on the fixes from step 3 already being applied.
5. Give the user a final summary: what was found, what was fixed, and what (if anything) was left for them to decide.

Do not launch `code-fixer` unless the user has agreed to apply fixes — review and fix are separate steps, and a read-only pass should never silently turn into edits.
