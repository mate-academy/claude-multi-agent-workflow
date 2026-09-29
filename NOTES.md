# NOTES

## What it does

`shipcheck` is a pre-merge quality gate for `course-api/`. Running `/shipcheck` reviews the route and data-layer code for bugs and convention drift, audits test coverage against the actual routes, and then writes or updates tests to close whatever gaps and issues turned up — verifying the fix by actually running the suite.

## Install

**Local development**, from the repo root:
```
cd course-api && npm install   # once
cd ..
claude --plugin-dir .
```
Then run `/shipcheck` inside the session. Use `/reload-plugins` after editing any plugin file to pick up changes without restarting.

**As a marketplace plugin**, from any session:
```
/plugin marketplace add <this-repo>
/plugin install shipcheck@shipcheck-marketplace
```

## Scoping decision: why the two subagents have different tools and models

`api-reviewer` is limited to `Read, Grep, Glob` on `haiku`, while `test-writer` gets `Read, Write, Edit, Grep, Glob, Bash` on `sonnet`. The reviewer's job is a bounded read-and-report scan — it reads a handful of files, checks them against known conventions (input validation, the `{ "error": "message" }` shape, routes going through `db/store.js`), and produces a text report. It never needs to change anything, so giving it `Write`/`Edit` would only expand its blast radius with no benefit, and a lighter model is enough for pattern-matching against a fixed checklist. `test-writer`, by contrast, has to generate correct, runnable test code, sometimes patch the route/store code to make a failing test pass, and then actually execute `npm test` via `Bash` to confirm its own work — that requires both the extra tool scope and the extra reasoning capability of a stronger model. Splitting the two also means a run of `/shipcheck` can never let a "read-only audit" step accidentally modify code — the write capability is confined to the one subagent whose job requires it.

## Orchestration decision: why Step 1 is parallel and Step 2 is sequential

`/shipcheck`'s Step 1 runs `api-reviewer` (reviewing route/store code for bugs) and `test-writer` in audit mode (listing which routes lack tests) at the same time. These two tasks read disjoint concerns — one inspects route logic, the other checks for the *existence* of test files — and neither needs the other's output to do its job, so running them in parallel just saves wall-clock time with no loss of correctness. Step 2, where `test-writer` actually writes or updates tests, has to run after both finish: it needs the reviewer's findings to know which issues deserve a regression test, and it needs the audit's list of gaps to know which routes need coverage at all. Making that step wait on both results is what keeps the tests it writes targeted, instead of guessing at what might be missing.
