# Notes: multi-agent-workflow plugin

## What it does and how to install it

The plugin reviews an Express API and then writes tests for what the review finds. One command, `/multi-agent-workflow:review-and-test`, runs two subagents as a workflow. It also bundles:

- `api-conventions`, a skill with the API's route conventions (status codes, error shape, validation, store access).
- A `PostToolUse` hook that lints any `.js` file Claude edits or writes with the project's ESLint. If there are lint errors, Claude sees them and fixes them.

Install it from this repo, which is both the plugin and its marketplace:

```
/plugin marketplace add GregDeMare/claude-multi-agent-workflow
/plugin install multi-agent-workflow@multi-agent-workflow-marketplace
```

Then run `/multi-agent-workflow:review-and-test`, or add a route file such as `routes/users.js` to limit the run to that file. To test local edits, start Claude with `claude --plugin-dir .` and use `/reload-plugins`.

## Scoping decision: `api-reviewer` is read-only on `sonnet`

`api-reviewer` gets `Read, Grep, Glob` and no `Write`, `Edit` or `Bash`. Its job is to judge code and report, so it never needs to change anything. Leaving those tools off means a reviewer can't edit a route or run a command, even if it misreads a prompt. The parallel reviewers also can't collide on files.

I gave it `sonnet` because deciding what counts as a bug takes reasoning. Examples are spotting that `Number("abc")` becomes a 404 where the conventions say 400, or that a PUT accepts `null`. `test-writer` gets `haiku` because its work is mostly pattern-following: copy the existing test style and cover the success, 400 and 404 cases. It needs `Write`, `Edit` and `Bash` to create tests and run `npm test`.

Limits of this scoping:
- `test-writer`'s "only edit `tests/`" rule is in its prompt, not enforced by tools, because a tools line can't be limited to a folder.
- It has `Bash`, which allows any shell command.

## Why some steps run in parallel and others in sequence

**Parallel: the reviews.** Each route file is reviewed on its own. The reviewer for `users.js` doesn't need anything from the one for `health.js`, so they start together in one message. This is faster and costs the same.

**Sequential: the tests.** `test-writer` runs only after every reviewer is done. Its brief is the merged, de-duplicated findings, so it can't start earlier. Running it first would produce tests written without knowing where the problems are.

**One writer, not one per route.** There's one `test-writer` because tests share a directory and sometimes a file. Several writers editing `tests/users.test.js` at once could overwrite each other. Reading can be parallel safely, but writing is kept to a single agent.

## Known gaps

- In headless (`-p`) runs, the test-writer's file writes were denied by permissions, so I haven't seen it write tests end to end. Run it interactively and approve the prompts.
- Still missing: a `LICENSE`, an `author` in `plugin.json`, and an install line in the README.
