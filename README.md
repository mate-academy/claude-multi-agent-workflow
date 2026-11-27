# quality-gate

A Claude Code plugin that runs a pre-PR quality check on an Express API as one multi-agent workflow: review the code and check the API docs in parallel, then write tests for whatever the review found untested.

It was built and tested against the API in [`course-api/`](course-api/).

## Install

```
/plugin marketplace add sabarish1993/claude-multi-agent-workflow
/plugin install quality-gate@sabarish-tools
```

Or load it straight from a clone, without installing:

```
claude --plugin-dir /path/to/claude-multi-agent-workflow
```

## What it adds

| Type | Name | What it does |
|---|---|---|
| Command | `/quality-gate:check [path]` | The workflow. Runs `code-reviewer` and `docs-checker` in parallel on the branch's changes, then hands the reviewer's "untested paths" to `test-writer`, then reports PASS/FAIL. |
| Subagent | `code-reviewer` | Read-only (`Read, Grep, Glob`, Sonnet). Reviews changed routes for validation, status codes, error shape and edge cases; returns findings by severity plus a list of untested paths. |
| Subagent | `docs-checker` | Read-only (`Read, Grep, Glob`, Haiku). Compares `docs/api.md` with the real routes and lists mismatches. |
| Subagent | `test-writer` | Can write (`Read, Grep, Glob, Write, Edit, Bash`, Sonnet). Adds `node:test` + supertest tests for a list of untested cases and runs `npm test`. Never edits app code. |
| Skill | `api-route-tests` | How tests are written in this kind of API: file layout, `store.reset()` setup, which cases every endpoint needs. Fires when you ask to write or fix route tests. |
| Hook | PostToolUse `Write\|Edit` | Runs the project's own ESLint with `--fix` on any `.js` file Claude edits (`${CLAUDE_PLUGIN_ROOT}/scripts/lint-edited-file.js`); exits 2 with the errors if some can't be fixed. Skips projects without ESLint. |

## Use it

```
cd course-api
claude --plugin-dir ..
> /quality-gate:check
```

You get one report: review findings, docs mismatches, tests added, the `npm test` result, and a numbered list of what to fix before the PR.

## Layout

```
.claude-plugin/
  plugin.json          manifest
  marketplace.json     catalog, so this repo is also the marketplace
agents/                code-reviewer, docs-checker, test-writer
commands/check.md      the workflow
skills/api-route-tests/SKILL.md
hooks/hooks.json
scripts/lint-edited-file.js
course-api/            the API it was tested against
```

## Versioning

`version` in `plugin.json` follows MAJOR.MINOR.PATCH and is bumped on every change, so installed copies pick up updates.
