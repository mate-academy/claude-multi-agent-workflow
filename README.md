# quality-crew

A Claude Code plugin that runs a small **code-quality crew** on an Express API:
parallel read-only reviews, then tests written for what the reviewers found,
then one report.

## Install

```
/plugin marketplace add juancarloscas00/claude-multi-agent-workflow
/plugin install quality-crew@juancarlos-plugins
```

To try it locally from a clone instead:

```
claude --plugin-dir .
```

## What's inside

| Piece | Name | What it does |
|---|---|---|
| Subagent (read-only) | `quality-crew:api-reviewer` | Reviews the files it is given and returns issues by severity plus untested behaviour. Tools: Read, Grep, Glob. |
| Subagent (writer) | `quality-crew:test-writer` | Turns a list of behaviours into tests under `tests/` and runs `npm test`. |
| Command | `/quality-crew:quality-check [api-folder]` | The workflow: reviews in parallel → tests for the findings → report. Defaults to `course-api`. |
| Skill | `quality-crew:api-conventions` | Route, validation and error-format rules; fires when adding or changing endpoints. |
| Hook | `PreToolUse` on `Bash` | Blocks `git push --force`, `git reset --hard`, `rm -rf` and touching `.env`. Script: `scripts/guard-bash.js`. |

## Try it on the course API

```
cd course-api && npm install && cd ..
claude --plugin-dir .
/quality-crew:quality-check course-api
```

The workflow adds new test files only; it never changes application code.
Delete the generated `tests/*.quality.test.js` files if you don't want to keep them.

The original assignment brief is in `ASSIGNMENT.md`.
