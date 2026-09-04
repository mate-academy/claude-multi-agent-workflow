# Notes on `api-quality`

## What it does and how to install it

`api-quality` runs a quality sweep of an Express API: two read-only agents inspect the code in
parallel (convention compliance and test coverage), their findings are merged into one
worklist, and a third agent closes the gaps and runs the suite. It's built and tested against
`course-api/` in this repo, but the agents take a target directory argument and generalize to
any Express service with the same route/store/test layout.

Install as a real user would, in a fresh Claude Code session:

```
/plugin marketplace add kl1874/claude-multi-agent-workflow
/plugin install api-quality@kl1874-plugins
```

For local development, from the repo root instead: `claude --plugin-dir .`, then
`/reload-plugins` after each edit. Either way, run `/api-quality:api-sweep course-api` to try
the workflow end to end.

## One scoping decision — why `test-gap-scout` is `haiku` with only `Read, Grep, Glob`

`test-gap-scout`'s job is to list every route, list every existing test, and match them up —
enumeration and pattern-matching with no judgment calls involved: a route either has a test that
exercises a given status code or it doesn't. That's exactly the kind of task where a cheaper,
faster model does just as well as an expensive one, so it gets `haiku`.

`api-reviewer` does a harder job on the same read-only surface: deciding whether a handler
*actually* honors a convention (is this validation sufficient? does this error shape count as
compliant? is this store function leaking a mutable reference?) takes real judgment, so it gets
`opus` even though its tool access is identical.

Both are restricted to `Read, Grep, Glob` — neither should ever be able to change the code it's
reviewing, since mixing "critic" and "editor" in one agent makes it too easy for review findings
to quietly become unreviewed edits. Only `test-author` gets `Write`, `Edit`, and `Bash`, because
running `npm test` and `npm run lint` to actually verify its own changes is the one job in this
plugin that genuinely requires mutating the tree and executing commands — and it only acts on a
worklist handed to it, it doesn't decide on its own what's wrong.

## One orchestration decision — why `/api-sweep` runs parallel then sequential

Step 2 (`api-reviewer` + `test-gap-scout`) runs as two concurrent agent launches in a single
message because the two jobs read disjoint concerns — convention compliance and test coverage —
touch no shared state, and neither one's output feeds the other. There's nothing to serialize,
so running them back-to-back would just be slower for no benefit.

Steps 3 (`test-author`) and 4 (verification re-review) are strictly sequential because each one
consumes the previous step's output as its input: `test-author` needs the *merged* worklist from
both Step 2 agents before it can decide what to fix, and the verification pass has nothing to
check until `test-author` has actually made changes. Starting either one early would mean acting
on incomplete information.
