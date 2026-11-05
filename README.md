# code-quality

A Claude Code plugin that runs a multi-agent code-quality workflow on an Express API: a read-only reviewer and a test writer work in parallel, then lint and tests verify the result.

## Install

```
/plugin marketplace add akennich/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

To try it locally from a clone: `claude --plugin-dir .`, then `/reload-plugins` after edits.

## What's inside

| Component | File | Purpose |
|---|---|---|
| Subagent | `agents/code-reviewer.md` | Read-only review for bugs, validation, security, maintainability (`sonnet`) |
| Subagent | `agents/test-writer.md` | Writes and fixes tests under `tests/`, runs `npm test` (`haiku`) |
| Command | `commands/quality-check.md` | `/code-quality:quality-check <path>` — the workflow |
| Skill | `skills/express-route-conventions/SKILL.md` | Route conventions for the API |
| Hook | `hooks/hooks.json` | Lints each `.js` file right after Claude edits it |

## Usage

```
/code-quality:quality-check course-api/routes/users.js
```

1. **Parallel:** `code-reviewer` and `test-writer` run at the same time on the target.
2. **Dependent:** once both finish, `npm run lint` and `npm test` run in `course-api/`, and review findings are cross-checked against test coverage.
3. **Report:** verdict, tests, lint, coverage gaps, and next actions.

Without an argument, the command uses the files in the current `git diff`.

## Layout

```
.claude-plugin/   plugin.json, marketplace.json (manifests only)
agents/  commands/  skills/  hooks/   (at the repo root)
course-api/       the Express API the plugin is tested against
```

## Version

Current version: `0.1.0` (see `.claude-plugin/plugin.json`).
