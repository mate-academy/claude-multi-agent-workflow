# Notes on api-quality-guard

## What it does

`api-quality-guard` is a Claude Code plugin that bundles a review-then-test workflow
for Express APIs (built and tested against `course-api/`):

- **`api-reviewer` agent** — read-only. Flags missing input validation, inconsistent
  status codes, unhandled async rejections, and inconsistent error shapes.
- **`test-writer` agent** — writes/edits test files and runs the suite to confirm they
  pass, prioritizing regression tests for whatever the reviewer flagged.
- **`/guard` command** — orchestrates both agents into one workflow (review → merge
  findings → write tests → report).
- **`express-route-checklist` skill** — the house rules the review is checked against,
  usable standalone when adding or reviewing a single route.
- **`hooks/hooks.json`** — notifies on route file edits (`notify-route-change.sh`).

## Install

As a marketplace plugin:

```
/plugin marketplace add wojciech-kowalik/claude-multi-agent-workflow
/plugin install api-quality-guard@claude-multi-agent-workflow
```

Or locally, from a checkout of this repo:

```
claude --plugin-dir .
```

Re-run `/reload-plugins` after editing plugin files during local development.

## Scoping decision: why `api-reviewer` gets `haiku` and read-only tools

`api-reviewer` is restricted to `Read, Grep, Glob` and pinned to `model: haiku`, while
`test-writer` gets `Read, Write, Edit, Grep, Glob, Bash` and `model: sonnet`.

**Why:** reviewing is a bounded, mechanical classification task — read a file, check it
against a fixed list of known failure patterns (missing validation, wrong status code,
unhandled rejection), and report. It doesn't need to write code, run commands, or reason
through multi-step edits, so giving it write access would only widen the blast radius
for no benefit — and it's also the agent the `/guard` command fans out N-at-a-time (one
per route file), so a cheaper, faster model keeps that parallel step cheap even as the
number of route files grows. Writing tests is a different shape of task: it requires
synthesizing what the review found into concrete test cases, matching the project's
existing test conventions, editing files, and running the suite to verify the result —
that benefits from a stronger model and needs `Write`/`Edit`/`Bash` to actually do the
work. Matching tool/model grants to what each step actually requires keeps the reviewer
cheap and safely read-only, and reserves the more expensive, more privileged agent for
the one step that needs it.

## Why `/guard` runs review in parallel and test-writing in sequence

The command fans out one `api-reviewer` per route file **at the same time**, then waits
for all of them before running a single `test-writer`.

**Why:** the reviews are independent — one reviewer's read of `users.js` doesn't depend
on another's read of `health.js`, so running them sequentially would only add wall-clock
time with no gain in correctness. Test-writing is different: `test-writer` needs the
*merged* findings from every reviewer to know what to target (a regression test for a
validation gap in `users.js` only makes sense once that gap has been found), so it must
start after step 3 (merge) completes, not alongside the reviewers. In short: parallelize
steps that don't depend on each other's output, and serialize the one step that
genuinely needs a prior step's result as its input.
