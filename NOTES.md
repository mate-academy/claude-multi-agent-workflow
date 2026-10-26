# Notes — api-quality

## What it does

`api-quality` runs a code-quality workflow on an Express API. `/api-quality:audit` sends two read-only subagents to review the code and map test coverage at the same time. A third subagent then writes tests for the gaps and findings they report and runs the suite. Claude finishes with one report: findings, coverage, the new tests, and any failing tests that point to real bugs.

Two more pieces round it out:
- the `express-api-conventions` skill gives the conventions (status codes, error shape, test style);
- a `PostToolUse` hook lints every `.js` file Claude writes or edits, using the project's own ESLint.

## How to install

```bash
/plugin marketplace add vladfe25/claude-multi-agent-workflow
/plugin install api-quality@vecherok-tools
```

For local development, run `claude --plugin-dir .` from the repo root and `/reload-plugins` after edits. Run `npm install` inside `course-api/` once so the tests and the lint hook have their dependencies.

## Scoping decision: who gets which tools and model

- **`api-reviewer` — `Read, Grep, Glob`, Sonnet.** A reviewer only reports; it never needs to change a file. With no `Write`/`Edit`/`Bash`, a review can't quietly "fix" code the user hasn't approved, and it's safe to run in parallel with anything. Spotting real bugs (a `NaN` id that falls through to a `404`, missing validation) takes judgment, so it gets Sonnet rather than Haiku.
- **`coverage-scout` — `Read, Grep, Glob`, Haiku.** Its job is mechanical: list routes and status codes, list what the tests assert, compare. Haiku does that well and is the cheapest, fastest model. It also gets no `Bash`, so it reasons from the code and doesn't run a coverage tool. The result is predictable and works on any machine.
- **`test-writer` — `Read, Grep, Glob, Write, Edit, Bash`, Sonnet.** It's the only agent that changes anything. It needs `Write`/`Edit` to add tests and `Bash` to run `npm test`. Its prompt limits it to `tests/` and tells it never to touch application code, so a failing test is reported as a likely bug and isn't "fixed" by changing the route.

## Orchestration decision: what runs in parallel and what waits

- **Parallel: `api-reviewer` + `coverage-scout`.** Both only read the same code, and neither needs the other's output. Running them together cuts Step 1 to the time of the slower one, and since neither writes, they can't conflict.
- **Sequential: `test-writer` waits for both.** It has nothing to work on until it has the "Not covered" table and the review's `Test idea:` lines. Starting it earlier would mean guessing which tests to write. Waiting gives two kinds of tests: coverage tests for untested branches and regression tests for suspected bugs. It also keeps the only writer running alone, so no other agent reads files while they change.
- **Final report by the main conversation.** Combining the results is cheap and needs all three outputs, so it stays with the orchestrator instead of a fourth subagent.
