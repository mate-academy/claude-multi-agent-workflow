## Code Quality Workflow

A Claude Code plugin that bundles a multi-agent code quality workflow — scoped subagents, an orchestrating command, a skill, and a hook — built and tested against the Express API in `course-api/`.

### Structure

- `.claude-plugin/plugin.json` — plugin manifest (`name`, `version`)
- `.claude-plugin/marketplace.json` — marketplace catalog listing this plugin
- `agents/` — scoped subagents
- `commands/` — the workflow command that orchestrates the subagents
- `skills/` — supporting skill(s)
- `hooks/` — hook configuration (`hooks.json`) and any bundled scripts
- `course-api/` — the sample Express API used to build and test the plugin against
- `NOTES.md` — install steps and design decisions

### Install

```
/plugin marketplace add DenShysh/claude-multi-agent-workflow
/plugin install code-quality-workflow@claude-multi-agent-workflow
```

Or locally, from the repo root:

```
claude --plugin-dir .
```
