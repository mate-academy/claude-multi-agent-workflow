# code-quality

A Claude Code plugin that packages a multi-agent **code quality** workflow for Express APIs (tested against `course-api/`).

## What’s included

| Piece | Name | Role |
| --- | --- | --- |
| Subagent | `code-reviewer` | Read-only review (validation, status codes, conventions) |
| Subagent | `test-writer` | Writes/edits tests from review findings |
| Command | `/quality-check` | Orchestrates parallel review + inventory, then dependent test writing |
| Skill | `api-conventions` | Course-api route and error-shape conventions |
| Hook | PostToolUse on Write/Edit | Reminds you to lint after edits |

## Install

### From this repo as a marketplace

```text
/plugin marketplace add romanblyashuk94/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

### Local development

```bash
claude --plugin-dir .
```

After edits: `/reload-plugins`.

## Usage

From a session with the plugin loaded, against `course-api/`:

```text
/quality-check
```

Or invoke the subagents by their namespaced names when you only need one step.

## Layout

```text
.claude-plugin/
  plugin.json          # plugin manifest
  marketplace.json     # marketplace catalog (this repo)
agents/                # scoped subagents
commands/              # workflow command
skills/                # skill(s)
hooks/                 # hooks.json
scripts/               # hook helpers (resolved via ${CLAUDE_PLUGIN_ROOT})
course-api/            # sample Express API to exercise the plugin
NOTES.md               # design notes
```

## Version

`1.0.0` — see `.claude-plugin/plugin.json`.
