# multi-agent-workflow

A Claude Code plugin that reviews an Express API and then writes tests for what the review finds. One command runs two scoped subagents as a workflow.

## Install

```
/plugin marketplace add GregDeMare/claude-multi-agent-workflow
/plugin install multi-agent-workflow@multi-agent-workflow-marketplace
```

## Usage

```
/multi-agent-workflow:review-and-test
/multi-agent-workflow:review-and-test routes/users.js
```

With no argument it covers every file in `course-api/routes/`. Passing a route file limits the run to that file.

## What's inside

| Component | Name | Purpose |
|---|---|---|
| Subagent | `api-reviewer` | Read-only review of route code for bugs, weak validation and convention deviations (`sonnet`) |
| Subagent | `test-writer` | Writes and runs tests for the routes, without changing app code (`haiku`) |
| Command | `review-and-test` | Reviews each route in parallel, then writes tests from the merged findings |
| Skill | `api-conventions` | The API's route conventions: status codes, error shape, validation, store access |
| Hook | `PostToolUse` lint | Lints any `.js` file Claude edits or writes, via `scripts/lint-changed.sh` |

## Try it on the sample API

`course-api/` is an Express API to run the plugin against. Run `npm install` in it once.

To test local edits, start Claude from the repo root with `claude --plugin-dir .` and use `/reload-plugins` after changes.

## Design notes

See [NOTES.md](NOTES.md) for why the subagents got the tools and models they did, and why some steps run in parallel and others in sequence.
