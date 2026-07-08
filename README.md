# code-quality plugin

A Claude Code plugin that reviews, fixes, and verifies code quality on an
Express API, using two scoped subagents orchestrated as a workflow.

## What's inside

- **`agents/code-reviewer.md`** — read-only reviewer (`Read`, `Grep`, `Glob`).
  Finds bugs, missing validation, and missed not-found handling; never edits
  anything.
- **`agents/code-fixer.md`** — write-capable fixer (`Read`, `Edit`, `Write`,
  `Grep`, `Glob`, `Bash`). Applies fixes for findings handed to it, then runs
  the test suite to verify.
- **`commands/quality-check.md`** — the `/quality-check` workflow: runs the
  reviewer and a test/lint baseline in parallel, then (if there's anything to
  fix) runs the fixer as a dependent step against the combined findings.
- **`skills/express-route-review/SKILL.md`** — encodes this project's route
  conventions (validation, not-found handling, error shape, data access
  pattern) so they're applied automatically, not just when reviewing.
- **`hooks/hooks.json`** — a `PostToolUse` hook that auto-runs `eslint --fix`
  on any `course-api/*.js` file Claude edits or writes.

## Install

From a marketplace (this repo doubles as one):

```
/plugin marketplace add huuphong91/claude-multi-agent-workflow
/plugin install code-quality@huuphong91-plugins
```

Or locally, from a clone of this repo:

```
claude --plugin-dir .
```

## Use

Run `/quality-check` from a session with this plugin loaded, in a repo that
has an Express-style `course-api/` (routes + `db/store.js` + tests). It will
review, report a baseline, fix what needs fixing, and re-verify.

## Try it against the bundled course API

This repo includes `course-api/` — the same small Express API used earlier in
the course — to build and test the plugin against:

```
cd course-api && npm install
claude --plugin-dir ..
```

Then run `/quality-check` from that session.
