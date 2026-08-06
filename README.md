# release-changelog

A Claude Code plugin that reviews a code diff, runs the test suite, and posts a changelog entry to Notion — but only when both succeed.

## What it does

Running `/release-changelog:changelog` kicks off a workflow:

1. **In parallel:** reviews the current git diff (via the `code-reviewer` subagent) and runs the project's test suite
2. **Gated:** if tests pass and the review produced a usable summary, posts a changelog entry to Notion (via the `write-changelog` subagent)
3. If tests fail, nothing gets posted — you get a report of the failure instead

A `PreToolUse` hook backstops the gate at the tool-call level, so a failing test suite blocks the Notion post even if the workflow's own logic is bypassed somehow.

## Requirements

- A Notion MCP server connected at the user or project level (`mcp__notion__*` tools) — this plugin does not bundle its own Notion MCP server, it uses whatever's already configured in your Claude Code session
- A repo with a runnable test command (developed against a small Express API in `course-api/`, adjust the test command in `commands/changelog.md` for other stacks)

## Install

```
/plugin marketplace add https://github.com/ericmsebastian/claude-multi-agent-workflow
/plugin install release-changelog@ericmsebastian-plugins
```

## Components

| Component | What it does |
|---|---|
| `agents/code-reviewer.md` | Read-only. Reviews the current git diff, returns a structured summary. |
| `agents/write-changelog.md` | Posts a changelog entry to Notion via `mcp__notion__post_page`. Only invoked after tests pass. |
| `commands/changelog.md` | `/release-changelog:changelog` — orchestrates the full workflow. |
| `skills/changelog-entry/SKILL.md` | Manual changelog drafting/review in house style, for use outside the automated workflow. |
| `hooks/hooks.json` | Blocks `mcp__notion__post_page` unless tests have passed this run. |

## Usage

```
/release-changelog:changelog
```

Run it from a repo with an active diff and a test suite. See `NOTES.md` for design decisions behind the tool scoping and the parallel/dependent step structure.
