# NOTES

## What this plugin does

`quality-guard` is a small code-quality workflow for Express-style APIs, built and tested against `course-api/`. It bundles:

- **`code-reviewer`** (read-only subagent) — reads route/data-layer code and reports bugs, security issues, convention drift, and untested paths.
- **`test-writer`** (write/edit subagent) — writes or edits tests in `tests/` to close gaps, then runs `npm test` to confirm they pass.
- **`/quality-guard:qa`** — the workflow command that runs both reviewer passes in parallel, merges their findings, then hands them to the test writer as a dependent step.
- **`express-test-patterns`** skill — the `node:test` + `supertest` conventions this codebase expects (status codes, error shape, `beforeEach(() => store.reset())`), so generated tests fit in rather than inventing a new style.
- **A `PostToolUse` hook** (`hooks/hooks.json` → `hooks/scripts/lint-check.js`) — after any `Edit`/`Write` on a JS file, lints it and reports issues back to Claude, so drift gets caught immediately instead of at the next manual review.

### Install

```
/plugin marketplace add romanazhniuk/claude-multi-agent-workflow
/plugin install quality-guard@roman-plugins
```

For local iteration: clone the repo, `cd course-api && npm install` once, then run `claude --plugin-dir .` from the repo root and use `/reload-plugins` after edits. Try it with `/quality-guard:qa course-api`.

## Scoping decision: why `code-reviewer` only gets `Read, Grep, Glob`

`code-reviewer` is deliberately locked to `Read`, `Grep`, and `Glob` — no `Write`, `Edit`, or `Bash`. The job it does (spot bugs, security issues, and coverage gaps and *describe* them) never requires changing anything, and giving it write access would blur the one property that makes the two-step workflow trustworthy: the review step is a side-effect-free opinion you can run twice in parallel without either run stepping on the other's output or on the repo itself. `test-writer`, by contrast, is scoped to `Read, Write, Edit, Grep, Glob, Bash` because its job is to actually create/modify files under `tests/` and run `npm test` to prove the new tests pass — it needs `Bash` for the test run and `Write`/`Edit` for the files, but I did not give it `Grep`-only or drop `Read` since it still needs to read the source under test and the existing test style before writing anything. Both use the `sonnet` model — the work (reading Express route handlers, writing `node:test` cases) is well-scoped and doesn't need the extra reasoning depth of a heavier model; there's no step here complex enough to justify the cost difference.

## Orchestration decision: why Step 1 is parallel and Step 2 is dependent

`/qa` runs `code-reviewer` **twice, in parallel**, once scoped to `routes/` + `server.js` and once to `db/`. These two reviews don't read or write anything the other touches — reviewing the route layer and reviewing the data layer are fully independent pieces of analysis — so running them sequentially would just be waiting twice for no benefit. Running them in parallel halves the wall-clock time of Step 1 with zero coordination cost.

Step 2 (`test-writer`) is **dependent** on Step 1 by necessity, not by convention: it needs the *merged* "untested paths" (and any bugs) from both reviews before it can decide what tests to write. Writing tests before the reviews finish would mean guessing at coverage gaps instead of acting on findings, and could easily produce tests that don't target the real problems the review just found. So the workflow is structured as fan-out (parallel, independent review) → join → fan-in (dependent, informed test generation), which mirrors how a human would actually do this: read the routes and the data layer at the same time, then write tests once you know what's actually missing.
