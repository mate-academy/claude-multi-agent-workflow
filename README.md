# code-quality-workflow

**Version:** 0.1.0

A Claude Code plugin that runs a multi-agent code quality workflow. Two read-only reviewers inspect your code in parallel, their findings are consolidated into one deduplicated list, and a fixer agent then applies the confirmed fixes. The plugin also bundles a reusable code-quality skill and a hook that reminds Claude to validate code after it changes it.

This repository is both the plugin and the marketplace that offers it.

## Agents

| Agent | Role | Tools |
| --- | --- | --- |
| `code-reviewer` | Read-only reviewer. Inspects code for correctness risks and maintainability problems and reports structured findings. Never modifies files. | Read, Grep, Glob |
| `code-fixer` | Applies confirmed findings with small, focused edits. Does not discover new issues. | Read, Edit, Write, Grep, Glob |

## Workflow command

```
/code-quality-workflow:quality <target>
```

`<target>` is a file, a directory, or a description of what to check. If you give none, the whole project is used (dependency folders such as `node_modules` are skipped).

The command acts only as a coordinator. The work is done by the subagents:

1. **Parallel review.** Two `code-reviewer` agents run at the same time on the same target, each with its own focus so they don't overlap:
   - Reviewer A: correctness (bugs, validation, error handling, edge cases, security basics).
   - Reviewer B: maintainability (duplication, naming, readability, complexity, dead code, conventions).
2. **Consolidation.** Once both reviewers finish, their findings are merged, deduplicated, sorted by severity, and renumbered. If the merged list is empty, the workflow stops and reports that no issues were found.
3. **Fix (dependent step).** Only after consolidation, a single `code-fixer` agent runs. It depends on the consolidated list, so it cannot start earlier. It fixes only those findings.
4. **Summary.** The command reports the findings per reviewer, what remained after deduplication, the files changed, and which findings were fixed, skipped, or partially fixed.

## Skill

**`code-quality`** (`skills/code-quality/SKILL.md`) is reusable guidance for reviewing code and fixing quality problems. It covers correctness, validation, error handling, edge cases, maintainability, readability, duplication, and project conventions, and how to report and fix issues. Claude uses it when reviewing code, auditing a module, checking a change before merge, or fixing code smells.

## Hook

A **PostToolUse** hook (`hooks/hooks.json`) runs after every `Edit` or `Write` tool call. It runs `hooks/scripts/quality-reminder.js`, referenced through `${CLAUDE_PLUGIN_ROOT}`, which reminds Claude to validate the changed code with the project's existing checks (tests, linting, formatting, type checking, or build) before finishing, and to say what it ran.

## Load the plugin locally

From the repository root:

```
claude --plugin-dir .
```

Use `/reload-plugins` to pick up edits while you work.

## Included test project: course-api

`course-api/` is a small Express API included as a real codebase to run the plugin against.

```
cd course-api
npm install
npm test
npm run dev
```

`npm test` runs the test suite, and `npm run dev` starts the API at `http://localhost:3000` (override with the `PORT` environment variable).

## Install from the marketplace

```
/plugin marketplace add <owner>/<repository>
/plugin install code-quality-workflow@code-quality-marketplace
```

## Repository structure

```
.
├── .claude-plugin/     # plugin.json and marketplace.json only
├── agents/             # code-reviewer, code-fixer
├── commands/           # quality (workflow command)
├── skills/             # code-quality/SKILL.md
├── hooks/              # hooks.json and scripts/quality-reminder.js
└── course-api/         # Express API used to test the plugin
```

Only the manifest files live inside `.claude-plugin/`. All component folders sit at the repository root.
