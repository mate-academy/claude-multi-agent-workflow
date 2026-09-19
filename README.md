# kodree

A Claude Code plugin that bundles a review-and-test workflow: two scoped subagents, a `/ship` command that orchestrates them, a PR-description skill, and a pre-commit hook — all themed around getting a change reviewed and tested before it's committed.

## Structure

- `.claude-plugin/plugin.json` — plugin manifest (name, version, description)
- `.claude-plugin/marketplace.json` — marketplace catalog listing this plugin (`source: "./"`), so the repo installs by name
- `commands/ship.md` — `/kodree:ship`, runs the review/test workflow
- `agents/code-reviewer.md` — read-only subagent, reviews changed code for bugs and unclear names
- `agents/test-writer.md` — read/write subagent, adds regression tests for what the review flags
- `skills/pr-description/` — turns a reviewed, tested change into a paste-ready PR description
- `hooks/hooks.json` — blocks `git commit` until `/kodree:ship` has run
- `NOTES.md` — install instructions and the reasoning behind the scoping and orchestration choices

## Install

```bash
claude plugin marketplace add josefberman/claude-multi-agent-workflow
claude plugin install kodree@claude-multi-agent-workflow
```

See `NOTES.md` for details.

## Testing against `course-api/`

This repo also includes `course-api/`, a small Express API, used to exercise the plugin against real code:

```bash
cd course-api && npm install
```

Then, from the repo root, load the plugin locally with `claude --plugin-dir .` and run `/kodree:ship` against changes in `course-api/`.
