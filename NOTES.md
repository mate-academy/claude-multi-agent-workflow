# NOTES — code-quality plugin

## What it does

`code-quality` is a Claude Code plugin that bundles a small code-quality workflow around the
`course-api` Express project:

- **`code-reviewer`** subagent — read-only. Reviews a file or diff for correctness bugs, convention
  violations, and missing edge cases, and returns a findings report. Never edits anything.
- **`test-writer`** subagent — reads a route/module, writes or extends its `node:test` +
  `supertest` coverage, and runs the suite. Can create/edit test files.
- **`/qa`** command — orchestrates the two subagents as a workflow: review and test-writing run in
  parallel, then a dependent summary step cross-checks both results.
- **`commit-message-style`** skill — keeps commit messages and PR descriptions in Conventional
  Commits format (`type(scope): summary`).
- **`hooks.json`** hook — `PostToolUse` on `Write`/`Edit` runs `eslint --fix` on any `.js` file
  touched inside `course-api/`, via a bundled script resolved through `${CLAUDE_PLUGIN_ROOT}`.

## Install

From a fresh Claude Code session, with this repo as the marketplace:

```
/plugin marketplace add ievgen-nikiforov/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

For local development without a marketplace round-trip, run from the repo root instead:

```
claude --plugin-dir .
```

Use `/reload-plugins` after editing any component to pick up changes without restarting the
session.

## Scoping decision: why `code-reviewer` only gets `Read, Grep, Glob`

`code-reviewer` is deliberately locked to read-and-search tools, with no `Write`/`Edit`/`Bash`.
The job is to find problems and describe them — it never needs to change a file to do that. Giving
it write access would let it "fix" what it finds instead of reporting it, which removes the human
(or the `test-writer`/developer) from deciding whether the fix is correct and in scope. Keeping it
read-only also makes it safe to run automatically and in parallel with another subagent (see
below) without any risk of the two stepping on each other's edits. `test-writer`, by contrast,
*needs* `Write`/`Edit` to create test files and `Bash` to actually run `npm test` and confirm the
new tests pass rather than just assuming they would — its job requires changing the working tree,
so it gets the tools that let it verify its own output instead of guessing.

Both subagents use `model: sonnet`: reviewing a diff against existing conventions and writing
tests that follow an established pattern are both moderate-complexity tasks — not simple enough to
hand to a cheaper model, not complex enough to need the most capable one.

## Orchestration decision: why `/qa` runs review and test-writing in parallel, then summarizes in sequence

Review and test-writing are independent of each other's *output*: `code-reviewer` doesn't need to
know what tests exist to find a bug in `routes/users.js`, and `test-writer` doesn't need the
review's verdict to notice that `PUT /users/:id` has no test for a missing record. Since neither
subagent's input depends on the other's result, running them one after another would just add
wall-clock time for no benefit — so `/qa` step 1 dispatches both at once and waits for both to
finish.

The final summary step is different: it explicitly needs *both* results to do its actual job,
which is cross-checking them against each other (e.g. "the reviewer flagged a missing 404 check,
but did the new tests actually cover it?"). That comparison is impossible to write correctly with
only one of the two inputs, so this step cannot start until step 1 has fully completed — it's a
genuine dependency, not an arbitrary ordering choice.
