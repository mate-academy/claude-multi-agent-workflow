# Notes — api-quality

## What the plugin does

`api-quality` is a code-quality pass for an Express API. One command,
`/api-quality:quality-pass`, runs two read-only reviewers over the code at the same
time — `route-reviewer` for handler correctness, `contract-auditor` for drift
between `docs/api.md` and the routes that actually exist — merges their findings,
and then hands that merged list to `test-writer`, which adds regression tests and
runs the suite. The plugin also ships the API's house rules as a skill
(`express-api-conventions`) and a `PostToolUse` hook that lints every JavaScript
file Claude writes or edits.

## Install

From a fresh session:

```
/plugin marketplace add MishaLehotskyi/claude-multi-agent-workflow
/plugin install api-quality@misha-plugins
```

Then run it against the bundled sample API:

```
/api-quality:quality-pass course-api/
```

To develop the plugin, load it from a clone instead — `claude --plugin-dir .` from
the repo root, and `/reload-plugins` after each edit. The sample API needs its
dependencies once, `cd course-api && npm install`, before the hook or `test-writer`
can run ESLint and the suite.

Everything appears under the plugin's namespace: the command is
`/api-quality:quality-pass`, the agents are `api-quality:route-reviewer`,
`api-quality:contract-auditor`, and `api-quality:test-writer`, and the skill is
`api-quality:express-api-conventions`.

## A scoping decision — why `contract-auditor` is read-only on `haiku`

`contract-auditor` gets `tools: Read, Grep, Glob` and `model: haiku`, the cheapest
combination in the plugin. That is deliberate, and it follows from what the job
actually is.

The job is a diff, not a judgement. Line the endpoints in `docs/api.md` up against
the routers mounted in `server.js` and say where they disagree — a documented status
code no handler can return, a required field the doc omits. That is table-filling
work with a well-defined right answer, and `haiku` does it as well as a larger model
would while costing a fraction as much. Spending `opus` on it would buy nothing.

The read-only tool line matters more than the model. This agent runs *concurrently*
with `route-reviewer` over the same files. If either could write, two agents would
be editing the same tree with no coordination between them, and whichever finished
second would be reasoning about a file the first had already changed. Denying both
of them `Write` and `Edit` is what makes the parallel step safe to run at all — the
read-only scope is not just least privilege, it is the precondition for the
concurrency.

`route-reviewer` is read-only for the same reason but sits on `opus`, because its job
is the opposite kind of work: deciding whether a handler is *wrong*. That means
holding the conventions, the route, and the store in mind at once and reasoning
about what a request would actually do — the part of this workflow where a better
model earns its cost.

`test-writer` is the one agent with `Write`, `Edit`, and `Bash`, because it cannot do
its job without them: it has to create test files and run the suite. It is scoped by
instruction rather than by tools — told to touch tests only, and specifically told
that when a test fails because the route is genuinely wrong, it leaves the test red
and reports the bug instead of editing the route to make it pass. It runs alone, so
no other agent is competing for the tree while it writes.

## An orchestration decision — what runs in parallel and what waits

**Steps 1a and 1b run in parallel.** `route-reviewer` and `contract-auditor` read
the same files and neither consumes the other's output. Running them in sequence
would double the wall-clock time and change nothing about the results, so the
command tells the orchestrator to launch both in a single message and wait for both
to return.

**Step 2 waits.** `test-writer` cannot start until both reviewers are done, because
the findings *are* its input — what gets tested is decided by what they found. This
is a genuine data dependency, not a stylistic ordering. Starting it early would mean
writing tests for gaps nobody had identified yet, which is the same as writing them
blind.

There is a second reason to keep this step sequential: it is the only step that
writes. Because it runs after both reviewers have finished, it never edits a file
another agent is still reading.

**Step 3 waits too.** The final summary needs the reviewers' verdicts *and*
`test-writer`'s pass/fail counts, so it is the last thing that happens. The command
forbids the orchestrator from re-running the suite itself — it reports the counts it
was handed, so the summary always reflects the run that actually produced the tests.

The shape, in short:

```
Step 0  orient (read package.json, CLAUDE.md, list files)
Step 1  route-reviewer  ║  contract-auditor      parallel — independent, read-only
Step 2  test-writer                              dependent — needs both reports
Step 3  summary                                  dependent — needs all three
```

## Design notes

- **The hook is quiet by default.** `hooks/scripts/lint-changed.js` skips
  non-JavaScript files, `node_modules`, and any project without ESLint installed,
  and it only speaks up when lint actually fails. A hook that fires on every edit
  has to be silent when it has nothing to say, or it gets turned off.
- **It exits `2`, not `1`.** On a `PostToolUse` hook, exit `2` is what feeds stderr
  back to Claude, so the lint errors land in the transcript and get fixed in the same
  turn instead of being discovered later.
- **The script is Node, not shell.** It is invoked as
  `node "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/lint-changed.js"`, which resolves
  wherever the plugin installs and runs the same on Windows, macOS, and Linux. A
  bash script with `jq` would have needed both a shell and a tool that may not be
  there; Node is already a hard requirement for the project being linted.
- **The skill duplicates `course-api/CLAUDE.md` on purpose.** `CLAUDE.md` only loads
  for sessions in that repo. The skill travels with the plugin, so the conventions
  are available anywhere it is installed — and it goes further than the `CLAUDE.md`
  summary, spelling out the test pattern and the `NaN`-id case that the sample API
  gets wrong.

## Known gaps in the sample API

Verified against `course-api/` on a clean checkout — these are what the first pass
should find:

- `GET /users/abc` returns `404 User not found`. `Number('abc')` is `NaN`, the store
  finds nothing, and a malformed id gets reported as a missing record instead of a
  `400`.
- `PUT /users/1` with `{"name": ""}` returns `200` and stores the empty name, while
  `POST /users` rejects the same value with a `400`. The two handlers disagree about
  what counts as valid input.
- `store.listUsers()` hands back the internal array by reference, so a caller can
  mutate the store without going through it.
