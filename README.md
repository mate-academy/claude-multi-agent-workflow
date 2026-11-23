# api-quality-kit

A Claude Code plugin that runs a multi-agent quality workflow on the Express API in `course-api/`.

## What it contains

| Component | Path | Purpose |
|---|---|---|
| Read-only reviewer | `agents/api-reviewer.md` | Reviews routes, db and server against `docs/api.md` and `CLAUDE.md`. Tools: Read, Grep, Glob. |
| Test writer | `agents/test-writer.md` | Analyzes test coverage (ANALYZE mode), then adds tests under `course-api/tests/` only (WRITE mode). Tools: Read, Grep, Glob, Write, Edit. |
| Workflow command | `commands/api-quality.md` | `/api-quality-kit:api-quality` runs the workflow: parallel analysis, dependent gap selection, test writing, checks. |
| Skill | `skills/api-test-conventions/SKILL.md` | Test conventions for course-api (node:test, supertest, error shape). |
| Hook | `hooks/hooks.json` + `hooks/guard-app-code.js` | `PreToolUse` on Write/Edit: blocks changes to `course-api/routes/`, `course-api/db/`, `course-api/server.js`. |

## Install

From a Claude Code session in a repository that contains this plugin's marketplace:

```
/plugin marketplace add ekorik-tech/claude-multi-agent-workflow
/plugin install api-quality-kit@api-quality-marketplace
```

To install a branch before it is merged, add the branch as a ref:

```
/plugin marketplace add ekorik-tech/claude-multi-agent-workflow#feat/api-quality-plugin
```

## Use

Open a session in a project that contains `course-api/`, then run:

```
/api-quality-kit:api-quality
```

The workflow works only on `course-api/`. It checks before and after each stage that application code did not change.

## Limits

- The hook covers the Write and Edit tools only. Shell redirects, MultiEdit and other write paths are not blocked.
- The hook is a guard against accidental edits, not a security boundary.
- The workflow needs `npm install` in `course-api/` before `npm test` can run.

## Local development

Load the plugin from this repository without installing it:

```
claude --plugin-dir .
```

Run `/reload-plugins` after editing a component.
