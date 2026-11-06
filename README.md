# code-quality

A Claude Code plugin that runs a multi-agent code quality workflow. One command reviews code, lints and tests it, then writes tests for the gaps it finds.

It is built and tested against the Express API in `course-api/`.

## What it adds

| Component | Name | What it does |
| --- | --- | --- |
| Command | `/code-quality:quality-check [path]` | Runs the whole workflow: review, lint and tests in parallel, then test-writing, then a report |
| Subagent | `quality-reviewer` | Read-only reviewer. Returns findings by severity and a list of untested behaviour |
| Subagent | `test-writer` | Writes and runs tests for the gaps. Edits test files only |
| Skill | `api-testing-conventions` | How tests for the course API should be written |
| Hook | `PostToolUse` on `Write` and `Edit` | Lints each edited `.js` file with the project's ESLint and feeds problems back to Claude |

## Install

```
/plugin marketplace add the-dsw/claude-multi-agent-workflow
/plugin install code-quality@oporto-plugins
```

To try it from a local checkout instead:

```
claude --plugin-dir .
```

The hook uses the project's own ESLint, so run `cd course-api && npm install` once.

## Usage

```
/code-quality:quality-check course-api/routes/users.js
```

Use `/reload-plugins` after editing plugin files. See `NOTES.md` for the design decisions.

## Layout

```
.
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── agents/
│   ├── quality-reviewer.md
│   └── test-writer.md
├── commands/
│   └── quality-check.md
├── skills/
│   └── api-testing-conventions/
│       └── SKILL.md
├── hooks/
│   ├── hooks.json
│   └── lint-changed.js
├── course-api/
├── NOTES.md
└── README.md
```
