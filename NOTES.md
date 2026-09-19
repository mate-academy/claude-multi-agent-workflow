# NOTES

## What this plugin does

`kodree` is a small review/test/ship workflow plugin for Claude Code. It bundles:

- **`agents/code-reviewer.md`** — a read-only subagent that reviews changed code for correctness bugs and unclear naming, and reports findings without editing anything.
- **`agents/test-writer.md`** — a subagent that writes or edits unit tests for a specific finding, following the project's existing test style, and runs the suite to confirm.
- **`commands/ship.md`** — `/kodree:ship`, the one-word trigger that runs both agents as a two-phase workflow: review everything, then write regression tests for whatever the review flagged.
- **`skills/pr-description/SKILL.md`** — an auto-firing skill that turns a reviewed, tested change into a short, paste-ready pull request description.
- **`hooks/hooks.json`** + **`hooks/check-before-commit.sh`** — a `PreToolUse` hook on the `Bash` tool that blocks `git commit` and points at `/kodree:ship`, so review/tests happen before a commit lands.

## How to install it

The plugin hosts its own marketplace entry (`.claude-plugin/marketplace.json`, `source: "./"`), so it can be added straight from this repo:

```bash
claude plugin marketplace add josefberman/claude-multi-agent-workflow
claude plugin install kodree@claude-multi-agent-workflow
```

(Or, from a local checkout: `claude plugin marketplace add /path/to/claude-multi-agent-workflow`.)

Then enable it if it isn't already (`claude plugin enable kodree`), and run `/reload-plugins` inside a session to pick up any further edits without restarting.

## Scoping decision: why the two agents don't share tools or a model

`code-reviewer` gets `Read, Grep, Glob` only, on `sonnet`. `test-writer` gets `Read, Edit, Write, Bash, Grep, Glob`, on `haiku`.

**Why:** the reviewer's whole job is to judge code without touching it — giving it `Edit`/`Write` would let a bad call turn into a bad edit, and there's no legitimate reason for it to need them. Catching a subtle bug or a misleading name is a judgment call, so it gets the stronger model. `test-writer`'s job is mechanical once it understands the target function: follow the existing test file's imports and style, add cases, run the suite. That's lower-difficulty, pattern-following work, so it runs on the cheaper model — but it does need write access and `Bash` to actually create test files and execute them.

## Why `/kodree:ship` runs parallel, then sequential

**Phase 1 (parallel):** each `code-reviewer` call only needs the files in its own group — one group's review doesn't depend on another's outcome. Running them one after another would just add wall-clock time for no benefit, so they launch together.

**Phase 2 (sequential, dependent on Phase 1):** `test-writer` is told what to test as a direct output of Phase 1 — the specific bug or edge case a review flagged. It has nothing to act on until the reviews are back, so it can't start earlier; the dependency is causal, not just a convenience ordering.
