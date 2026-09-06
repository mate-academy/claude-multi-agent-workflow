# NOTES

## What the plugin does

`api-quality` packages one workflow: sweep an Express API for convention violations, then close
the test gaps that sweep finds. `/api-quality:quality-sweep [path]` runs two read-only
`api-reviewer` subagents over disjoint halves of the tree at the same time, merges their findings,
hands the untested-behaviour list to a single `test-author` subagent, and prints one report. The
`express-api-conventions` skill is the shared rulebook both agents judge against, and a
`PostToolUse` hook lints every JS file Claude writes or edits, feeding the errors straight back.

## Install

```
/plugin marketplace add volodymyrlp/claude-multi-agent-workflow
/plugin install api-quality@volodymyr-plugins
```

Locally, without installing: `claude --plugin-dir .` from the repo root, then
`/api-quality:quality-sweep course-api/`. `/reload-plugins` picks up edits. One-time setup for the
test target: `cd course-api && npm install`.

## A scoping decision: why the reviewer has no Bash and no Edit

`api-reviewer` is `tools: Read, Grep, Glob` and nothing else. The temptation was to give it `Edit`
— it finds a missing `Number()` conversion, why not let it fix it? Because the review and the fix
are different jobs with different failure modes. A reviewer that can edit stops reporting: it
quietly patches what it finds, and the report I actually wanted — a list of what's wrong, with
severity — degrades into "I fixed some things". Worse, a fix applied mid-review changes the file
the *other* parallel reviewer may be reading. Read-only makes the agent's output reproducible and
its blast radius zero, which is what lets me run two of them concurrently without thinking about it.

It gets `model: opus` anyway, because the hard part of this workflow is judgment — recognising that
`store.getUser(req.params.id)` returns `undefined` for every request because the store compares
with `===` against numbers. That's the finding worth paying for. `test-author` runs on `sonnet`:
by the time it starts, the thinking is done and the work is mechanical — turn a list of named
behaviours into `node:test` cases in an established house style. It gets `Write`, `Edit`, and
`Bash` because it genuinely needs all three (write the file, run `npm test`, read the failures),
but its instructions fence it to `course-api/tests/` and forbid touching production code to make
its own tests pass.

## An orchestration decision: what runs together, what waits

**Parallel — the two reviews.** Reviewer A takes `server.js` + `routes/`; Reviewer B takes
`db/store.js` + `tests/`. Neither reads the other's output, neither writes anything, and the scopes
don't overlap, so running them in one message roughly halves the review wall-clock. The split isn't
arbitrary: it's surface versus core, which is also how the findings differ — A finds contract bugs
(wrong status code, wrong error shape), B finds state and coverage bugs.

**Sequential — the test backfill.** `test-author` cannot start early, and not just because it needs
input. It needs the *merged* list: Reviewer A says "`PUT /users/:id` with an empty body is
untested", Reviewer B is the only one who knows whether `tests/users.test.js` already covers it.
Starting the author after Reviewer A alone would produce duplicate tests; starting it after B alone
would miss the route-level cases entirely. The dependency is on the join of both, which is exactly
what makes it a real sequential step rather than a fan-out that happens to be ordered.

The same logic sets the boundary of the last step: the report waits for the test *run*, not just
the test *writing*, because "tests added" without "`npm test` passed" is a claim, not a result.

## Known limits

- The reviewers are tuned to this codebase's conventions (Express + an in-memory store module).
  Pointed at a different stack they'd still read the code, but the rules they cite would be the
  wrong ones — retune `skills/express-api-conventions/SKILL.md` first.
- The lint hook stays silent when `node_modules` is missing rather than nagging on every edit, so
  a fresh clone gets no linting until `npm install` has run.
- The parallel step is fixed at two reviewers over a two-way split. A larger API would want the
  split derived from the tree, not hardcoded in the command.
