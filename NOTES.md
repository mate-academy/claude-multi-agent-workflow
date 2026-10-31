# Notes: code-quality-workflow

## Installing from the GitHub marketplace

The plugin is published through a marketplace defined in `.claude-plugin/marketplace.json`
(marketplace name `code-quality-marketplace`, hosted in the GitHub repo
`pever8/claude-multi-agent-workflow`). Inside Claude Code, run:

```
/plugin marketplace add pever8/claude-multi-agent-workflow
/plugin install code-quality-workflow@code-quality-marketplace
```

The marketplace entry points at the repo root (`"source": "./"`), so the commit that
contains `.claude-plugin/`, `agents/`, `commands/`, `skills/` and `hooks/` must be pushed to
GitHub before the install works. Once installed, run the workflow with
`/code-quality-workflow:codequality [path]`. With no path it targets `course-api/`.

## Scoping decision: a read-only reviewer and a fixer that can edit

The two subagents have deliberately different tool sets, set in their frontmatter:

- **code-reviewer** has `tools: Read, Grep, Glob` and runs on the cheaper `haiku` model.
  It can only look at code, never change it, because reviewing is a judgment task and a
  reviewer that can also edit might "fix" things silently or rewrite code it is judging.
  The limit is enforced by the tool list, not just by the prompt, and the validator
  requires at least one read-only agent.
- **test-fixer** has `tools: Read, Grep, Glob, Edit, Write, Bash` and runs on `sonnet`.
  Fixing a failing test needs to run the test command (Bash) and change code (Edit/Write),
  so it gets exactly those extra tools. Its prompt still limits it: make the smallest
  change, never delete, skip or weaken a test, and never commit.

Keeping edit access in only one agent means every file change comes from one place that
reports what it touched, while the review stays an independent second opinion.

## Orchestration decision: parallel diagnosis, then sequential fixes

`commands/codequality.md` runs in two stages with a checkpoint between them:

1. **Stage 1, parallel.** The review and the test diagnosis do not depend on each other:
   one reads the code, the other runs the tests. Both subagents are launched in a single
   message so they run at the same time. `test-fixer` is told to diagnose only and not
   edit any files, so running it alongside the reviewer cannot cause conflicting edits.
2. **Checkpoint.** The command waits for both results. If the tests pass and the review
   found nothing worth fixing, it skips Stage 2.
3. **Stage 2, sequential.** Fixing depends on Stage 1: `test-fixer` needs the review
   findings and the root causes, and it cannot see Stage 1 on its own, so the command
   passes them in. It fixes failing tests first, applies only Critical, High or clearly
   safe review findings, then re-runs the relevant tests and the full suite to verify.
   Edits happen in one agent, one step at a time, so they cannot collide, and the final
   test run confirms the fixes did not break anything.

The command never commits, so the user reviews the changes first.
