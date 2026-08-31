# qa-kit

A Claude Code plugin for a review-and-test workflow: two subagents that check
and cover your changes, a command that runs them together, a skill for
finding coverage gaps, and a hook that reminds you to write tests as you go.

## Purpose

qa-kit exists to catch two things that are easy to skip in the moment:
unreviewed changes and untested code. Instead of remembering to ask for a
review and then separately remembering to write tests, `/verify` runs both
as one workflow — reviewing every changed file in parallel, then writing
tests from what the reviews found.

## What it bundles

### Subagents (`agents/`)

- **`code-reviewer`** — read-only. Reviews changed code for bugs, missing
  error handling, and unclear names, and returns a short list grouped by
  severity. Scoped to `Read, Grep, Glob` only — its job is to report
  problems, not fix them.
- **`test-writer`** — writes or extends unit tests for a file, function, or
  endpoint, following the repo's existing test conventions, then runs them
  and reports pass/fail. Scoped to `Read, Grep, Glob, Write, Edit, Bash`
  since it needs to produce and run files.

### Commands (`commands/`)

- **`/verify`** — the main workflow. Finds the changed files, runs a
  `code-reviewer` call per file in parallel, then hands the combined
  findings to a single `test-writer` call (sequential, since it depends on
  the review output) to write and run tests. Reports review findings and
  test results together.
- **`/summarize-changes`** — lists touched files with a one-line description
  each, short enough to paste into a PR description.

### Skills (`skills/`)

- **`coverage-gaps`** — auto-triggered when you ask what's untested or want
  coverage gaps found before a release/PR. Finds source files with no
  matching test file and reports them grouped by directory, without writing
  anything itself.

### Hooks (`hooks/`)

- **`check-test-coverage.js`** (via `hooks.json`) — runs on `PostToolUse`
  after `Edit`/`Write`. If the file you just touched has no sibling test
  file, it prints a non-blocking reminder pointing at `test-writer` or
  `/verify`.

## Install

From inside Claude Code, add this repo as a marketplace and install the
plugin from it:

```
/plugin marketplace add <path-or-url-to-this-repo>
/plugin install qa-kit
```

For local development, run Claude Code with the plugin loaded directly from
its working directory, and use `/reload-plugins` to pick up edits:

```
claude --plugin-dir .
```

## Usage

- **`/verify`** — review and test everything you've changed in one pass.
- **`/summarize-changes`** — get a PR-ready summary of what changed.
- Ask "what's not tested?" or "find coverage gaps" to trigger the
  `coverage-gaps` skill.
- Just edit or write a file — the coverage hook will nudge you if it has no
  test yet.

See `NOTES.md` for the reasoning behind the tool scoping and the
parallel/sequential split in `/verify`.
