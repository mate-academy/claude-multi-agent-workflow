# NOTES

## What the plugin does

`code-quality` is a plugin for reviewing and fixing an Express API's code quality. It bundles:

- **`code-reviewer`** — a read-only subagent that reads route/data-access code and reports correctness bugs and convention violations (bad status codes, wrong error shape, state bypassing `db/store.js`).
- **`code-fixer`** — a subagent that takes findings (from the reviewer, or from a failing test/lint run) and patches the code, then re-runs `npm test` / `npm run lint` to confirm the fix.
- **`/ship-check`** — a workflow command that runs the reviewer and the test/lint suite in parallel, then (only if something needs fixing) runs the fixer as a dependent step, and reports whether the API is ready to ship.
- **`api-conventions`** skill — documents the validation, status-code, and error-shape rules both subagents check code against.
- A **lint-on-save hook** — after any `Edit`/`Write` to a `.js` file, runs ESLint on that file and surfaces warnings without blocking the edit.

## How to install

From a clean checkout, in a Claude Code session:

```
/plugin marketplace add <this-repo-url-or-path>
/plugin install code-quality@code-quality-marketplace
```

For local development, load it directly without a marketplace:

```
claude --plugin-dir .
```

Then run `/ship-check` from the repo root (with `course-api/` set up via `cd course-api && npm install`).

## Scoping decision: why `code-reviewer` is read-only

`code-reviewer`'s `tools` line is limited to `Read, Grep, Glob` — no `Edit`, `Write`, or `Bash`. Review and fixing are different jobs with different risk: a reviewer that can also edit files could "fix" something while forming its opinion of what's wrong, which makes its findings unverifiable and its edits unreviewed. Keeping it read-only forces every change to go through `code-fixer`, whose whole job is applying and verifying edits — so there's always a clean "here's what's wrong" step before a "here's what changed" step, and the two are never blurred together. It also means the reviewer is safe to run against any code, including code the caller isn't ready to have modified yet.

## Orchestration decision: why Step 1 is parallel and Step 2 is dependent

`/ship-check`'s Step 1 runs `code-reviewer` and `npm test`/`npm run lint` at the same time because they're independent: the reviewer reads the code by eye, while the test/lint run exercises it mechanically. Neither needs the other's output to do its job, so running them sequentially would just add wait time for no benefit. Step 2 (`code-fixer`) has to be dependent, not parallel, because it needs the combined output of both Step 1 checks as its input — it can't fix problems it hasn't been told about yet, and it also needs Step 1 to be fully finished so it isn't patching code that the reviewer or test run is still mid-evaluation of.
