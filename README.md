# claude-multi-agent-workflow

A Claude Code plugin marketplace (`MarQaSpace`) containing one plugin, **`ship-kit`**: agents, a slash command, a skill, and a hook for reviewing and summarizing code changes. The repo also holds `course-api`, a small Express API used as the working project to exercise the plugin against.

## Install

```
/plugin marketplace add https://github.com/laszlozsidek/claude-multi-agent-workflow
/plugin install ship-kit@MarQaSpace
```

## What's in `ship-kit`

### Agents
- **`code-reviewer`** (Sonnet) — reads changed code, excluding tests, and reports bugs, missing error handling, and unclear names, grouped by severity.
- **`test-scanner`** (Haiku) — scans changed test files and inserts a `/** TODO: add documentation */` block above any test that doesn't already have one. Haiku is used here because the task is low-risk, repeatable, and mechanical (check-and-add), unlike code review which needs more judgment.

### Command
- **`/summarize-changes`** — runs `code-reviewer` and `test-scanner` in parallel (they're independent: one inspects source, the other inspects tests, and neither needs the other's output), waits for both to finish, then produces a short summary of every file touched on the branch, ready to paste into a pull request description. Reports "No test changes" if no test files changed, and writes a detailed failure report for either sub-agent instead of skipping it if one fails or times out.

### Skill
- **`pr-description`** — writes pull request descriptions in the house format: What changed, Why, How to test.

### Hook
- **`PostToolUse`** — runs `npm run lint` inside `course-api` after any Edit/Write under `course-api/**`.

## `course-api`

A small Express API (see `course-api/README.md` and `course-api/CLAUDE.md` for details) used to exercise the plugin's agents, command, and hook during development.
