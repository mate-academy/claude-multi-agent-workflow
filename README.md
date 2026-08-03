# code-quality

A Claude Code plugin that bundles a code-quality workflow: two scoped subagents, a command that orchestrates them, a lint-fix skill, and a lint-on-save hook.

## What's inside

- **Subagents** (`agents/`)
  - `code-reviewer` — read-only. Reviews code for bugs, style issues, and risky patterns; returns findings, never edits files.
  - `test-runner` — runs the test suite and can write or edit code to fix failing tests or add missing coverage.
- **Command** (`commands/quality-check.md`) — `/quality-check` runs the review and the test suite in parallel, then synthesizes both into one report.
- **Skill** (`skills/lint-fix/SKILL.md`) — guidance for fixing ESLint violations consistently.
- **Hook** (`hooks/hooks.json`) — runs ESLint `--fix` automatically after any file edit.

## Install

From a Claude Code session:

```
/plugin marketplace add <this-repo>
/plugin install code-quality@<marketplace-name>
```

Or for local development, from the repo root:

```
claude --plugin-dir .
```

## Try it against `course-api/`

```
cd course-api
npm install
```

Then, in a Claude Code session with the plugin loaded, run `/quality-check` against the `course-api` code.
