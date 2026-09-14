# NOTES

## What this plugin does

`code-quality` is a small, self-contained code-quality workflow for Express APIs
built like `course-api/`. It bundles:

- **`agents/code-reviewer.md`** — a read-only subagent that reads routes and the
  data-access layer and reports a findings list of bugs, missing validation, and
  convention violations. It never edits anything.
- **`agents/code-fixer.md`** — a subagent that takes a specific list of issues and
  applies the minimal fix, verifying with `npm test` / `npm run lint`.
- **`commands/audit.md`** — the `/code-quality:audit` command, which runs both
  subagents (plus the automated checks) as one workflow.
- **`skills/api-conventions/SKILL.md`** — this project's actual conventions (one
  route file per resource, all data access through `db/store.js`, `400`/`404`
  handling, `{ "error": "message" }` error shape), so review and fixes are checked
  against real project rules, not generic advice.
- **`hooks/hooks.json`** — a `PostToolUse` hook that lints a file with ESLint right
  after it's edited or written, via a bundled script referenced through
  `${CLAUDE_PLUGIN_ROOT}` so it works wherever the plugin is installed.

## Install

Local development, from the repo root:
```
claude --plugin-dir .
```

As a published plugin, from any Claude Code session:
```
/plugin marketplace add alxitk/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```
(While this was still only pushed to `develop`, it was added and installed from
that branch specifically with `alxitk/claude-multi-agent-workflow#develop` — the
default branch alone wouldn't have had the plugin yet.)

## Scoping decision: why the two subagents differ

`code-reviewer` is limited to `Read, Grep, Glob` and runs on `model: opus`. It never
touches the filesystem, so it can't cause a bad edit — the only risk from getting a
review wrong is a bad *suggestion*, which a human or `code-fixer` can reject. Because
judging whether something is actually a bug (versus intentional, versus a false
positive) is the hard, nuanced part of the job, it gets the strongest model.

`code-fixer` is given `Read, Edit, Write, Grep, Glob, Bash` and runs on `model: sonnet`.
It needs write access because its whole job is to change files — but each thing it's
asked to fix is already a specific, scoped issue (not "find problems in this codebase"),
so it doesn't need frontier-level judgment, and giving it a cheaper, faster model keeps
the fix loop quick. The `Bash` tool is scoped to this agent alone, since only it needs
to run `npm test` / `npm run lint` to verify its own edits — the reviewer has no reason
to execute anything.

This split — one agent that can only look, one that can only act on a specific,
already-identified issue — means a bad review can't corrupt code, and the fixer never
has to guess what "good" looks like from scratch.

## Orchestration decision: why `/audit` has a parallel step and a dependent step

Stage 1 runs `code-reviewer` and the automated `npm test` / `npm run lint` checks in
parallel because they're genuinely independent: the reviewer is reading code to find
issues a linter/test suite can't (missing validation, wrong status codes, convention
drift), while the automated checks catch what they're built to catch (broken tests,
lint violations). Neither one needs the other's output to do its job, so running them
one after another would just add wall-clock time for no benefit.

Stage 2 — dispatching `code-fixer` — has to be sequential and depend on Stage 1,
because it needs Stage 1's combined output (the reviewer's findings plus any failing
tests/lint errors) as its actual input. There's nothing for the fixer to fix until the
review and checks have run, so starting it any earlier would mean guessing at what's
broken instead of acting on real findings.
