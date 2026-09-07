# NOTES

## What this plugin does

`course-quality-guard` is a code-quality plugin for the `course-api` Express app. It targets the
project's *specific* conventions (all data access through `db/store.js`, `400`/`404` validation,
`{ "error": "message" }` error shape, and test coverage per route) — the kind of drift a generic
linter has no concept of. It bundles:

- **`agents/convention-auditor.md`** — read-only subagent that audits `course-api/routes`, `db`,
  and `tests` against `course-api/CLAUDE.md` and reports a structured findings checklist.
- **`agents/fix-and-cover.md`** — subagent that consumes that checklist, applies mechanical fixes,
  writes missing tests, reruns `npm test`, and leaves anything needing human judgment for review.
- **`commands/code-quality-check.md`** — the `/code-quality-check` workflow command that
  orchestrates both agents (see "Orchestration decision" below).
- **`skills/new-endpoint/SKILL.md`** — scaffolds a new Express resource (route, store helpers,
  test) that follows conventions from the start.
- **`hooks/hooks.json`** — a `PostToolUse` nudge on route edits (heuristic check for the #1
  violation: bypassing `db/store.js`) and a `PreToolUse` gate that blocks `git commit` if
  `course-api`'s test suite is failing.

## How to install

From a clean checkout of this repo:

```
claude --plugin-dir .                       # load locally to test
/plugin marketplace add <this-repo-url>     # once pushed, from any Claude Code session
/plugin install course-quality-guard@course-api-marketplace
```

Before testing against `course-api`, install its dependencies once: `cd course-api && npm install`.

## Scoping decision: why `convention-auditor` is read-only and `fix-and-cover` is not

`convention-auditor` is given only `Read`, `Grep`, `Glob` — it produces a checklist, and nothing
about auditing requires changing files. Keeping it read-only means it's safe to run at any time
(e.g. before every commit) with no risk of it silently altering code while "just checking."
`fix-and-cover` needs `Read`, `Edit`, `Write`, and `Bash` because its job is the opposite: turn a
checklist into real changes and verify them by actually running `npm test`. Splitting audit from
fix into two separately-scoped agents means the risky, file-changing half of the workflow is
isolated to one agent with a narrow, explicit mandate — it only acts on findings it was handed
(or a plainly described issue), and anything requiring a design judgment call is explicitly left
for a human instead of being "fixed" unilaterally.

## Orchestration decision: why the command runs one step in parallel and one dependent

`/code-quality-check`'s first step runs `convention-auditor` and `npm test`/`npm run lint` in
parallel because they're independent of each other — the auditor reads code for convention drift,
the test run checks current pass/fail state, and neither needs the other's output to do its job.
Running them together instead of sequentially saves real time on every invocation.

The second step (`fix-and-cover`) has to be dependent on *both* finishing first: it needs the
auditor's checklist to know what to fix, and it needs the pre-fix `npm test` baseline so it can
tell whether a test failure it sees afterward was already broken versus something it introduced.
Running it any earlier would mean acting on an incomplete picture.
