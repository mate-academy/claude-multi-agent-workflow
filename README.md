# quality-flow

A Claude Code plugin (and its own marketplace) for code quality on Express APIs.
One command runs a multi-agent workflow: a reviewer and a coverage scout analyse the code **in parallel**,
then a test-writer **uses both reports** to add the missing tests and run the suite.

> The original course assignment text is in [`ASSIGNMENT.md`](ASSIGNMENT.md).

## Install

```text
/plugin marketplace add 2005igor2023-crypto/claude-multi-agent-workflow
/plugin install quality-flow@quality-flow-marketplace
```

Local development (from the repo root):

```bash
claude --plugin-dir .
```

## What's inside

| Component | Path | Namespaced name | Purpose |
|---|---|---|---|
| Subagent (read-only, sonnet) | `agents/code-reviewer.md` | `quality-flow:code-reviewer` | Reviews routes/store against `CLAUDE.md` conventions |
| Subagent (read-only, haiku) | `agents/coverage-scout.md` | `quality-flow:coverage-scout` | Maps endpoints ↔ tests, lists gaps |
| Subagent (writer, sonnet) | `agents/test-writer.md` | `quality-flow:test-writer` | Writes tests under `tests/`, runs `npm test` |
| Command | `commands/quality.md` | `/quality-flow:quality [dir]` | Orchestrates the workflow |
| Skill | `skills/api-test-conventions/SKILL.md` | `quality-flow:api-test-conventions` | How tests are written (node:test + supertest) |
| Hook | `hooks/hooks.json` → `hooks/scripts/check-js.js` | PostToolUse on Write/Edit | `node --check` on edited JS; blocks with the error on failure |

## Usage

```text
/quality-flow:quality course-api
```

Requires Node.js on `PATH` (used by the hook). The sample API lives in `course-api/` (`npm install` once).
