# qa-workflow-kit — notes

## What the plugin does

`qa-workflow-kit` is a Claude Code plugin that bundles code-quality helpers for
the `course-api` Express project. It ships:

- **`route-reviewer`** — a subagent that checks a single file in
  `course-api/routes/` against the project's conventions (mounting, data access
  through `db/store.js`, status codes, `{ "error": "message" }` error shape,
  input validation) and reports findings. It does not modify code.
- **`test-writer`** — a subagent that writes or updates unit tests for a route
  file in the project's existing style (`node:test`, `node:assert`, `supertest`),
  runs `npm test`, and iterates until the suite passes.
- **`/qa-workflow`** — a slash command that orchestrates both: it runs
  `route-reviewer` and `npm run lint` in parallel, then feeds their results to
  `test-writer`, and finishes with a three-section summary (review / lint / tests).
- **`api-route-conventions`** — a skill capturing how routes in this project are
  structured, for use when adding or changing a route.

## How to install it

From the repo root (the marketplace lives in `.claude-plugin/marketplace.json`):

```
/plugin marketplace add .
/plugin install qa-workflow-kit@qa-workflow-kit
```

The first command registers the local directory as a marketplace named
`qa-workflow-kit`. The second installs the `qa-workflow-kit` plugin from that
marketplace — the `@qa-workflow-kit` suffix names the marketplace to install
from. Once installed, the plugin is active and `/qa-workflow-kit:qa-workflow`
(and the bare `/qa-workflow` alias) is available.

Run it against a route file:

```
/qa-workflow-kit:qa-workflow course-api/routes/health.js
```

## Scoping decision: why the two subagents differ

`route-reviewer` runs on **haiku** with a **read-only** toolset
(`Read, Grep, Glob`). Reviewing a route against a fixed checklist is
pattern-matching against known conventions, not reasoning-heavy work, so the
smaller, faster model is a good fit. Keeping the toolset read-only is a
deliberate guardrail: a reviewer that literally cannot call `Write`, `Edit`, or
`Bash` can never accidentally modify code while it is inspecting it. Review and
mutation stay cleanly separated.

`test-writer` runs on **sonnet** with **`Read, Write, Edit, Bash`**. Producing
correct tests — choosing meaningful cases, matching the project's style, and
then running `npm test` to confirm they actually pass and fixing them if they
don't — needs more reasoning and a broader toolset. It has to write files and
execute the suite, so it gets the write and shell access that `route-reviewer`
is intentionally denied.

## Orchestration: parallel then sequential

**Step 1 runs `route-reviewer` and `npm run lint` in parallel** because they are
independent. Lint analyses the file on its own rules and does not need the
review's findings; the review checks project conventions and does not need
lint's output. Running them concurrently is a straight latency win with no
ordering hazard.

**Step 2 waits for both to finish before running `test-writer` in sequence**
because `test-writer` consumes their output. It is told to add a test case for
each edge case `route-reviewer` flagged (a missing `404` branch gets a `404`
test, a validation gap gets a `400` test) and to account for any lint problems
in the file. It cannot start until those findings exist, so it is strictly
downstream of Step 1.
