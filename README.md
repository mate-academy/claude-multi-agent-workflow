# code-quality

A Claude Code plugin that bundles a small, themed **code-quality workflow** for an Express/Node.js API. It reviews changed code, maps where tests are missing, and writes the missing tests — orchestrated as a two-phase multi-agent pass.

> The original course assignment for this repo lives in [`ASSIGNMENT.md`](./ASSIGNMENT.md).

## What's inside

| Component | Name | What it does |
|-----------|------|--------------|
| Command | `/code-quality:quality-pass` | Runs the full pass: parallel review + coverage scan, then a dependent test-writing step. |
| Subagent | `code-reviewer` | **Read-only** reviewer (Read/Grep/Glob, sonnet). Surfaces bugs, missing validation, convention breaks. |
| Subagent | `test-author` | **Writer** (Read/Grep/Glob/Write/Edit/Bash, opus). Writes/extends tests and runs the suite. |
| Skill | `quality-checklist` | The project's quality rules to verify a change against before calling it done. |
| Hook | `PostToolUse` auto-lint | Runs ESLint on JS files under `course-api/` after every Write/Edit (advisory). |

## Install

From a clean checkout, add this repo as a marketplace and install the plugin:

```bash
/plugin marketplace add <this-repo-url-or-path>
/plugin install code-quality@mars-code-quality-marketplace
```

Or load it directly for local development from the repo root:

```bash
claude --plugin-dir .
```

## Usage

The bundled `course-api/` is the project to run against:

```bash
cd course-api && npm install   # once, so the suite and linter can run
```

Then, in a Claude Code session, trigger the workflow:

```
/code-quality:quality-pass
```

Phase 1 reviews the code and scans for test gaps **in parallel**; Phase 2 then **waits** for both and dispatches `test-author` to fill the gaps and confirm `npm test` passes. The reasoning behind those scoping and orchestration choices is written up in [`NOTES.md`](./NOTES.md).

## Layout

```
.claude-plugin/
  plugin.json          # manifest (name + version)
  marketplace.json     # marketplace catalog listing this plugin
agents/
  code-reviewer.md     # read-only reviewer
  test-author.md       # test writer
commands/
  quality-pass.md      # the workflow command
skills/
  quality-checklist/SKILL.md
hooks/
  hooks.json           # PostToolUse auto-lint
  scripts/lint-on-save.sh
```

Only `plugin.json` and `marketplace.json` sit inside `.claude-plugin/`; every component folder lives at the repo root.
