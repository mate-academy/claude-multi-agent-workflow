# NOTES

## What the plugin does, and how to install it

`ship-check` is a two-agent code-quality workflow built and tested against
`course-api/`. It reviews a change for bugs, missing error handling, and
unclear naming, checks whether the change is covered by tests, and closes
any gaps — all behind one `/ship-check` command. A `route-conventions`
skill fires automatically on route work to keep the route, the store
helper, the docs, and the tests moving together, and a `PostToolUse` hook
auto-runs `eslint --fix` on any `course-api/*.js` file Claude writes or
edits.

Install from a Claude Code session:

```
/plugin marketplace add sinkobela/claude-multi-agent-workflow
/plugin install ship-check@ship-check-marketplace
```

Or run it locally from a clone, from the repo root: `claude --plugin-dir .`

## One scoping decision — the two subagents' tools and models

`code-reviewer` gets `Read, Grep, Glob` only — no `Write`/`Edit`/`Bash` —
because its whole job is to look and report; giving it write access would
mean trusting its judgment to also *act* on findings it hasn't had a
second pass on, which is exactly the kind of unreviewed change this
plugin exists to catch. `test-writer` gets `Read, Write, Edit, Grep, Glob,
Bash`, because writing and running a test *is* its job — it needs to edit
the test file and run `npm test` to confirm what it wrote actually holds.

For models: `code-reviewer` runs on `sonnet`, because judging whether
something is a real bug versus a style nit, and assigning the right
severity, is exactly the kind of nuanced call a stronger model is worth
paying for — a wrong severity call (or a missed bug) is the kind of
mistake that's expensive to catch later. `test-writer` runs on `haiku`,
because its job is comparatively mechanical — follow the existing
`node:test`/`supertest` pattern already in the file, for a change whose
shape the review has usually already characterized — and, critically,
its output is self-verifying: a test either passes against real behavior
or it doesn't, and it runs `npm test` itself before reporting back. A
weaker model is an acceptable trade here because a wrong test fails loudly
immediately, rather than silently shipping a wrong judgment call the way
a missed review finding would.

## One orchestration decision — parallel vs. sequential in `/ship-check`

Step 1 runs `code-reviewer` and `test-writer`'s coverage scan **in
parallel**, because they're genuinely independent: reviewing the code for
bugs doesn't need to know what's covered by tests, and checking test
coverage against the diff doesn't need the review's opinion on code
quality. Running them one after another would just be waiting on nothing.

Step 2 — writing the missing tests — has to be **sequential**, and
specifically dependent on step 1's output, because it needs the combined
result of both: the coverage gaps `test-writer` already found on its own,
*plus* any additional missing-test findings `code-reviewer` flagged (it's
told to call these out explicitly rather than filing them as bugs). You
can't write the tests before you know what to write them for.

## What I actually ran, and what it found

I added a real, untested `DELETE /users/:id` route (route + a
`store.deleteUser` helper, no test) and ran `/ship-check:ship-check
course-api` against it via `claude --plugin-dir .`. Both subagents fired
concurrently — the session's own narration confirmed it was waiting on
one while the other had already finished — then correctly dispatched
`test-writer` a second time only after both step-1 results were in.

Real findings, not staged ones: `code-reviewer` caught a genuine
pre-existing high-severity bug (`PUT /users/:id`'s validation checks
`=== undefined`, not falsiness, so `""`/`null` slip through and can
corrupt a record) and a medium one (`Number(req.params.id)` silently
becomes `NaN` for a non-numeric id, always 404ing instead of 400ing). It
correctly declined to write a test that would have locked in either bug
as "correct" behavior, and said so explicitly, rather than treating those
as ordinary missing-coverage items. It added 5 new tests for the pure
coverage gaps (POST/PUT 400 cases, DELETE happy path and 404), leaving
`course-api` at 10/10 passing, verified independently outside the agent
session afterward.

I also independently confirmed: the `route-conventions` skill fires on an
unrelated, unnamed route request (verified via the transcript showing an
explicit `Skill: ship-check:route-conventions` invocation, followed by
edits across the route, store, docs, and test files together); and the
`PostToolUse` hook fires through the real hook system when Claude writes
a `.js` file under `course-api/` (confirmed both by piping a simulated
hook payload directly into `scripts/post-edit-lint.js`, and by a live
session writing a file containing `if (!!x)` and getting back `if (x)`).
