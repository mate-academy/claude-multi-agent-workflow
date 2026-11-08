# api-quality

A Claude Code plugin that reviews an Express API for code quality issues, applies fixes, and summarizes the changes.

## Install

```bash
/plugin marketplace add https://github.com/s-leoni/claude-multi-agent-workflow
/plugin install api-quality@api-quality-marketplace
```

## Usage

Start the API first:

```bash
cd course-api && npm install && npm run dev
```

Then run the workflow command in a Claude session:

```
/api-quality:quality-check
```

## What it does

1. **Parallel**: runs `code-reviewer` on the route files and a lint check at the same time
2. **Sequential**: `fixer` applies the combined findings and runs the test suite to confirm nothing broke
3. **Sequential**: summarizes all changed files for use in a pull-request description

## Components

| Component | Type | Purpose |
|-----------|------|---------|
| `code-reviewer` | Agent (read-only) | Reviews code for bugs, missing error handling, and unclear names |
| `fixer` | Agent (writer) | Applies fixes and verifies with `npm test` |
| `quality-check` | Command | Orchestrates the full workflow |
| `api-quality` | Skill | Express API quality rubric used by the reviewer |
| `hooks.json` | Hook | Runs ESLint automatically after every edit |

## Development

Load the plugin locally without installing from the marketplace:

```bash
claude --plugin-dir .
```

Use `/reload-plugins` inside a session to pick up edits without restarting.
