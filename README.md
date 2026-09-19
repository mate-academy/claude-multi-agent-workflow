# kodree

## Purpose

`kodree` is a Claude Code plugin that enforces a review-then-test workflow before code gets committed. It bundles two purpose-scoped subagents, a command that orchestrates them, a skill that writes the resulting PR description, and a hook that gates `git commit` on the whole thing having run.

The idea: nothing ships without a second pair of eyes (`code-reviewer`) and regression coverage for whatever that pair of eyes flags (`test-writer`) — automatically, not by convention.

## What's in the box

| Path | Role |
|---|---|
| `.claude-plugin/plugin.json` | Plugin manifest — name, version, description |
| `.claude-plugin/marketplace.json` | Marketplace entry (`source: "./"`) so this repo installs by name |
| `commands/ship.md` | `/kodree:ship` — runs the two-phase review/test workflow |
| `agents/code-reviewer.md` | Read-only subagent (`Read, Grep, Glob`) — flags bugs and unclear names, never edits |
| `agents/test-writer.md` | Read/write subagent (`Read, Edit, Write, Bash, Grep, Glob`) — writes and runs regression tests for what the review flagged |
| `skills/pr-description/` | Auto-firing skill — turns a reviewed, tested change into a paste-ready PR description |
| `hooks/hooks.json` | `PreToolUse` hook on `Bash` — blocks `git commit` until `/kodree:ship` has run |
| `NOTES.md` | The reasoning behind the scoping and orchestration decisions above |

## Installation

```bash
claude plugin marketplace add josefberman/claude-multi-agent-workflow
claude plugin install kodree@claude-multi-agent-workflow
claude plugin enable kodree
```

From a local checkout instead of the marketplace:

```bash
claude plugin marketplace add /path/to/claude-multi-agent-workflow
```

After editing plugin files, run `/reload-plugins` in an active session to pick up the changes without restarting.

## Usage

1. Make a change anywhere in the repo.
2. Run `/kodree:ship`. Phase 1 fans `code-reviewer` out in parallel over the changed files; phase 2 hands each finding to `test-writer`, which adds and runs the regression test for it.
3. Try `git commit` before running `/kodree:ship` and the pre-commit hook blocks it, pointing you back at the command.
4. Once review and tests are clean, ask for a PR description — the `pr-description` skill fires automatically and drafts one from the shipped diff.

See `NOTES.md` for why the two agents are scoped and ordered the way they are.

## Trying it against real code

`course-api/` is a small Express API included in this repo for exercising the plugin against actual changes:

```bash
cd course-api && npm install
```

From the repo root, load the plugin locally with `claude --plugin-dir .` and run `/kodree:ship` against edits under `course-api/`.
