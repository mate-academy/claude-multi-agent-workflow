# api-quality — a Claude Code plugin

A code-quality workflow for Express APIs, packaged as a Claude Code plugin. One command reviews the API, finds untested behaviour, writes the missing tests and reports what is broken.

This repo is both the plugin and the marketplace that offers it. The sample API it was built and tested against lives in [`course-api/`](course-api/). The original course brief is in [`ASSIGNMENT.md`](ASSIGNMENT.md).

## Install

```text
/plugin marketplace add Lemonch1ks/claude-multi-agent-workflow
/plugin install api-quality@lemonch1ks-plugins
```

Or try it from a local clone without installing:

```bash
cd course-api && npm install && cd ..
claude --plugin-dir .
```

## What's inside

| Component | Name | What it does |
|---|---|---|
| Command | `/api-quality:quality-check [path]` | Runs the whole workflow (default path: `course-api`). |
| Subagent | `api-quality:code-reviewer` | Read-only review of routes and the store (Sonnet; Read, Grep, Glob). |
| Subagent | `api-quality:coverage-scout` | Read-only map of endpoints → tests, lists gaps (Haiku; Read, Grep, Glob). |
| Subagent | `api-quality:test-writer` | Adds tests under `tests/` and runs `npm test` (Sonnet; Read, Grep, Glob, Write, Edit, Bash). |
| Skill | `api-quality:express-api-conventions` | Status codes, error shape, validation and test conventions. |
| Hook | `PostToolUse` on `Write\|Edit` | Runs the project's ESLint on any JS file Claude just changed and feeds errors back. |

## The workflow

```text
             ┌─ code-reviewer ──┐
target  ─────┤                  ├──► merge test list ──► test-writer ──► lint + report
             └─ coverage-scout ─┘
   step 1: parallel           step 2: waits for both   step 3: waits for step 2
```

## Layout

```text
.claude-plugin/
  plugin.json          # manifest (name, version)
  marketplace.json     # marketplace catalog listing this plugin
agents/                # code-reviewer, coverage-scout, test-writer
commands/              # quality-check (the workflow)
skills/express-api-conventions/SKILL.md
hooks/hooks.json       # PostToolUse → scripts/lint-on-save.js via ${CLAUDE_PLUGIN_ROOT}
scripts/lint-on-save.js
course-api/            # the Express API used for testing
```

## Versioning

Bump `version` in both `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`, commit, and push. Users get it with `/plugin marketplace update lemonch1ks-plugins`.

See [`NOTES.md`](NOTES.md) for design decisions.
