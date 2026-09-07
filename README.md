# code-quality

A Claude Code plugin that bundles a multi-agent code quality workflow: review, tests, and formatting for the API in `course-api/`.

## Install

```
/plugin marketplace add <this-repo>
/plugin install code-quality@<marketplace-name>
```

Or load it locally for development:

```
claude --plugin-dir .
```

## Structure

- `agents/` — scoped subagents
- `commands/` — the workflow command that orchestrates the subagents
- `skills/` — supporting skill(s)
- `hooks/` — hook(s) that fit the plugin's theme
