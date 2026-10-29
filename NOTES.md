# NOTES — quality-flow

## What the plugin does

`quality-flow` is a code-quality plugin for Express/Node projects. One command, `/quality-flow:quality-check [path]`, runs a multi-agent workflow:

1. **In parallel:** `code-reviewer` reviews the code for bugs and convention violations, while `test-gap-finder` maps every route behaviour to the existing tests and lists what is untested.
2. **Then:** `test-writer` takes both reports, writes the missing tests (plus tests that expose reviewed bugs) and runs `npm test`.
3. **Then:** the main session summarises verdict, tests added and test results.

It also ships:
- the `express-api-conventions` skill — the rules (status codes, `{ "error": "..." }` shape, store-only data access, test style) that the agents and you check against;
- a `PostToolUse` hook that runs the project's own ESLint on any `.js` file Claude writes or edits (`${CLAUDE_PLUGIN_ROOT}/scripts/lint-on-edit.js`) and feeds lint errors back to Claude.

## How to install

From any Claude Code session:

```
/plugin marketplace add khorkovenko/claude-multi-agent-workflow
/plugin install quality-flow@khorkovenko-plugins
```

To develop it locally from a clone:

```
claude --plugin-dir .
```

Then, against the bundled API: `cd course-api && npm install`, and run `/quality-flow:quality-check course-api`. Use `/reload-plugins` after editing plugin files.

## Scoping decision: `test-gap-finder` is read-only and runs on Haiku

`test-gap-finder` only needs to list route handlers and match them to `test(...)` calls — it is pattern matching over a few files, not reasoning about subtle behaviour. So it gets `Read, Grep, Glob` only (it must never touch the tests it is auditing, otherwise its report could describe a state it created) and the cheap, fast `haiku` model. `code-reviewer` is also read-only, but it runs on `sonnet` because spotting a real bug (e.g. `Number("abc")` → `NaN` reaching the store) needs stronger reasoning. `test-writer` is the only agent with `Write`, `Edit` and `Bash`: it has to create test files and run `npm test`, and it is told explicitly not to modify application code — keeping write access in exactly one agent makes it obvious which step changed the repo.

## Orchestration decision: why parallel, then sequential

- **Review and gap-finding run in parallel** because they are independent: both only read the same code, neither consumes the other's output, and neither writes anything, so there is no risk of one seeing the other's half-finished changes. Running them together roughly halves the wall-clock time of the read phase.
- **Test writing is a dependent step** because its input *is* the output of step 1: the list of missing tests comes from `test-gap-finder`, and the bug-exposing tests come from `code-reviewer`'s findings. Starting it earlier would mean guessing what to test. It is also the only step that writes files and runs the test suite, so running it alone avoids races with readers.
- **The summary is last** because it reports on the test run, which only exists after step 2.
