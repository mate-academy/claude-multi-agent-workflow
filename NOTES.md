# qa-kit

A Claude Code plugin that bundles a review-and-test workflow: two subagents, a
workflow command that runs them together, a skill for spotting coverage gaps,
and a hook that nudges you toward writing tests as you edit.

## What it does

- **`agents/code-reviewer.md`** — read-only subagent that reviews changed code
  for bugs, missing error handling, and unclear names.
- **`agents/test-writer.md`** — subagent that writes or extends unit tests for
  a file, following the repo's existing test conventions, then runs them.
- **`commands/verify.md`** — `/verify`, a one-word trigger that runs both
  subagents as a two-stage workflow (see below).
- **`skills/coverage-gaps/SKILL.md`** — auto-triggered skill that finds source
  files with no matching test file, without writing anything itself.
- **`hooks/hooks.json`** + **`hooks/check-test-coverage.js`** — a
  `PostToolUse` hook that fires after `Edit`/`Write` and prints a
  non-blocking reminder if the file you just touched has no sibling test.
- **`.claude-plugin/marketplace.json`** — lists the plugin so it can be
  installed from this repo as a marketplace source.

## Install

From inside Claude Code, add this repo as a marketplace and install the
plugin from it:

```
/plugin marketplace add <path-or-url-to-this-repo>
/plugin install qa-kit
```

For local development, pointing the marketplace add at the repo's working
directory (or a `file://` path) picks up edits without republishing anything.

## Scoping decision: why `code-reviewer` only gets `Read, Grep, Glob`

`code-reviewer`'s job is to *report* problems, not fix them — its whole value
is being a second, independent set of eyes before code changes. Giving it
`Edit`/`Write` would let it "helpfully" patch what it finds, which collapses
the review step into the fix step and removes the checkpoint the workflow is
built around. So its tools line is deliberately capped at read-and-search
tools (`Read, Grep, Glob`), and it runs on `sonnet` because reading code and
judging severity is language-heavy reasoning, not something a smaller/cheaper
model or a scripted check does reliably. `test-writer`, by contrast, is
scoped to include `Write, Edit, Bash` because its job requires producing
files and proving they pass — a read-only agent can't do that.

## Why `/verify`'s steps are parallel vs. sequential

`/verify` reviews each changed file with its own `code-reviewer` call, and
launches all of those calls **in parallel**: reviewing `file A` doesn't need
to know anything about `file B`, so running them one at a time would only add
latency, not correctness. It then hands off to a single `test-writer` call
**after** all the reviews are back, run **sequentially** — that step is
genuinely dependent: it needs the combined findings (which edge cases and
error paths the reviews flagged) to know what to write tests for, so it
can't start until step 1 has actually produced that output. Parallelizing
independent work and serializing dependent work is the whole point of
splitting the command into two named steps rather than one flat instruction.
