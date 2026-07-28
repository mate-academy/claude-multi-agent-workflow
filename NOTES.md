# Notes

## What this plugin does

`code-quality` bundles a two-agent review-and-fix workflow for a
JavaScript/Express codebase. `code-reviewer` reads the code and reports
findings; `code-fixer` applies fixes for those findings and confirms with
the test suite. A skill (`code-conventions`) gives both agents one shared
definition of what counts as a problem, and a hook lints files the moment
they're edited, independent of running the full workflow.

## Install

```
/plugin marketplace add <this-repo-url-or-local-path>
/plugin install code-quality@code-quality-marketplace
```

Or for local development, run `claude --plugin-dir .` from the repo root
and use `/code-quality:quality-check` directly — no marketplace step
needed while iterating.

## Scoping decision: why code-reviewer is read-only

`code-reviewer`'s `tools` are limited to `Read, Grep, Glob` — no `Edit`,
no `Bash`. A reviewer that can also edit files tends to "fix as it goes,"
which hides what it actually found and skips the fixer's job of verifying
each fix against the test suite. Keeping it read-only forces every change
to go through `code-fixer`, which is the one agent whose job is to run
`npm test` and `npm run lint` and prove nothing broke. It also means the
review step is safe to run on its own, any time, without risk of
unintended edits.

## Orchestration decision: why the review and the test/lint run in parallel

`code-reviewer` reading the code and `npm test` / `npm run lint` running
against it don't depend on each other — the review doesn't need the test
results to form an opinion, and the tests don't need the review to run.
Running them at the same time in `commands/quality-check.md` shortens the
workflow instead of doing three sequential things. `code-fixer` genuinely
can't start until both are done, though: it needs the reviewer's findings
*and* the concrete list of failing tests/lint rules before it knows what
to change, so that step stays dependent (sequential) on the first two.
