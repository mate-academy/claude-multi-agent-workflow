# code-quality-crew

A Claude Code plugin that runs a multi-agent code-quality workflow: a reviewer and a coverage mapper work in parallel, then a test writer closes the gaps they found. It also bundles an API test-conventions skill and a hook that lints JavaScript right after Claude edits it.

This repo is both the plugin and the marketplace that offers it (`aj-quality-tools`). It was built for the course project brief in [mate-academy/claude-multi-agent-workflow](https://github.com/mate-academy/claude-multi-agent-workflow).

## Install

In Claude Code:

```
/plugin marketplace add ajhoward96-ops/claude-multi-agent-workflow
/plugin install code-quality-crew@aj-quality-tools
```

Then run `/reload-plugins` or start a new session.

To try it from a local clone without installing:

```
claude --plugin-dir .
```

## What's inside

| Component | Name | What it does |
|-----------|------|--------------|
| Command | `/code-quality-crew:quality [path]` | Runs the whole workflow on a path (default `course-api/`). |
| Subagent | `code-quality-crew:code-reviewer` | Read-only review: bugs, validation, conventions. Returns findings plus behaviors that need tests. Sonnet. |
| Subagent | `code-quality-crew:coverage-mapper` | Read-only map of routes and branches to existing tests. Returns the gaps. Haiku. |
| Subagent | `code-quality-crew:test-writer` | Writes and edits tests for the gaps, then runs the suite. Sonnet. |
| Skill | `api-test-conventions` | How tests for an Express API are written here (node:test + supertest). |
| Hook | `PostToolUse` on Write/Edit | Runs ESLint on the edited `.js` file. Errors are sent back to Claude to fix. |

## The workflow

```
            ┌─ code-reviewer ───┐
target ─────┤                   ├──► test-writer ──► verify suite ──► summary
            └─ coverage-mapper ─┘
   Step 1: parallel           Step 2: depends    Step 3: depends
```

## Layout

```
.claude-plugin/
  plugin.json          # manifest (name, version)
  marketplace.json     # marketplace catalog listing this plugin
agents/                # code-reviewer, coverage-mapper, test-writer
commands/quality.md    # the workflow command
skills/api-test-conventions/SKILL.md
hooks/hooks.json       # PostToolUse lint hook
hooks/scripts/lint-on-edit.js
course-api/            # the Express API the plugin is tested against
NOTES.md               # design decisions
```

## Requirements

- Node.js 18+ (the hook script runs with `node`).
- The lint hook only runs where ESLint is installed (`node_modules/.bin/eslint`) next to an `eslint.config.*` file. Elsewhere it does nothing.

## Versioning

The version lives in `.claude-plugin/plugin.json` (and is mirrored in `marketplace.json`). Bump it with semver on each release so `/plugin` users get the update.
