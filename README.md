# code-quality

A Claude Code plugin that runs a multi-agent code quality workflow against your project.

## What's inside

| Component | Path | Purpose |
|-----------|------|---------|
| Subagents | `agents/` | Scoped workers (a read-only reviewer and an agent that writes fixes/tests) |
| Command   | `commands/` | One workflow command that orchestrates the subagents |
| Skill     | `skills/` | Project conventions the agents follow |
| Hook      | `hooks/hooks.json` | Lints files after edits, via a script in `scripts/` |

## Install

```
/plugin marketplace add biganashvili/claude-multi-agent-workflow
/plugin install code-quality@biganashvili-plugins
```

## Local development

```
claude --plugin-dir .
```

Then use `/reload-plugins` after edits. The `course-api/` folder is a sample Express API to test against (`cd course-api && npm install`).

## Layout

```
.claude-plugin/
  plugin.json        # manifest (only manifest files live here)
agents/
commands/
skills/
hooks/
scripts/             # bundled scripts, referenced via ${CLAUDE_PLUGIN_ROOT}
```
