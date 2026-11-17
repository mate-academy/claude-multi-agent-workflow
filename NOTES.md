# Notes: api-quality plugin

## What it does

`api-quality` adds one command, `/api-quality:quality [path]`, that checks the quality of an Express API in three steps:

1. A reviewer and a test-gap scout read the code at the same time.
2. A test writer uses both reports to write the missing tests and runs the test suite.
3. The main session runs `npm test` and `npm run lint` again itself and writes one report: findings, coverage before and after, tests added, and confirmed bugs.

The plugin also includes an `express-api-conventions` skill, which holds the house rules both the reviewer and the test writer follow, and a PostToolUse hook that lints every JavaScript file Claude edits with the project's own ESLint.

### Install

```text
/plugin marketplace add milangit/claude-multi-agent-workflow
/plugin install api-quality@milan-plugins
```

To develop or test locally, run `claude --plugin-dir .` from the repo root, then `/api-quality:quality course-api`. Use `/reload-plugins` after edits.

## Scoping decision: three agents, three different scopes

| Agent | Tools | Model | Why |
|-------|-------|-------|-----|
| `api-reviewer` | Read, Grep, Glob | sonnet | Finding real bugs (NaN ids, falsy checks rejecting valid input, wrong status codes) takes reasoning, so it gets a capable model. It only reports, so it gets no write or shell tools. A reviewer that can edit tends to "fix" things quietly, and then nobody can review the review. |
| `test-gap-scout` | Read, Grep, Glob | **haiku** | Building the coverage map is mechanical: grep the routes, grep the tests, match them up. A small, fast model does this well and costs much less. Running it next to the reviewer adds almost nothing to wall-clock time. |
| `test-writer` | Read, Grep, Glob, Write, Edit, **Bash** | sonnet | This is the only agent that changes files, and it needs Bash to run `npm test` and `npm run lint`, or it can't tell whether its tests pass. Its prompt narrows that further: write only under `tests/`, never touch app code, and run only the test and lint commands. The workflow command repeats the narrowing with `allowed-tools: Bash(npm test:*), Bash(npm run lint:*)`. |

The key choice was to **not** let the test writer fix bugs it finds. A failing test that exposes a real bug is kept and marked `todo`, and the bug goes into the report. Writing tests and changing behaviour are separate decisions, and the second one belongs to a person.

## Orchestration decision: what runs in parallel and what runs in sequence

- **Parallel (Step 1): reviewer + scout.** Both only read the same code and neither needs the other's output. Starting them together in one message makes Step 1 take as long as the slower agent, not the two combined. Because neither can write, running them at once can't cause a conflict.
- **Sequential (Step 2): test writer waits for both.** It needs the scout's list of missing (endpoint, status) pairs to know what to cover, and the reviewer's list of behaviours to pin down, so it can write regression tests for suspected bugs and not just happy paths. Started any earlier, it would guess at gaps and duplicate the scout's work. The command says explicitly not to start Step 2 until both results are back.
- **Sequential (Step 3): verify after writing.** The final `npm test` and `npm run lint` run in the main session after the test writer finishes. That way the numbers in the report come from an independent run, not from what the subagent says about its own work.

## Hook design

The hook is `node "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/lint-on-edit.js"`, so it resolves wherever the plugin is installed. It is written in Node rather than bash with `jq`, because anyone using this plugin already has Node and may not have `jq`. It walks up from the edited file to the nearest ESLint config and uses that project's local ESLint. It exits `2` (which sends the errors back to Claude) only on lint errors, and exits `0` in every other case, so a missing ESLint never blocks an edit.
