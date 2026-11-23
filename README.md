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

Before the plugin is merged into `main`, install it from the branch. Run this in a Claude Code session:

```
/plugin marketplace add ekorik-tech/claude-multi-agent-workflow#feat/api-quality-plugin
/plugin install api-quality-kit@api-quality-marketplace
```

This branch install was checked with version `0.1.0` at commit `813e04b`.

After the merge, `main` will contain the plugin, and the install without the branch suffix will work:

```
/plugin marketplace add ekorik-tech/claude-multi-agent-workflow
/plugin install api-quality-kit@api-quality-marketplace
```

Until the merge, the form without `#feat/api-quality-plugin` does not install this plugin, because `main` does not contain it.

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
