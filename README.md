# api-quality

A Claude Code plugin that runs a code-quality pass over an Express API: two
read-only reviewers work in parallel, their findings are merged, and a separate
agent turns the testable ones into real tests. A hook lints every JavaScript
file you touch along the way.

Built against the Express API in [`course-api/`](course-api), which is included
in this repository so the plugin can be tried on real code.

## Install

This repository is both the plugin and the marketplace that offers it.

```
/plugin marketplace add makar111111/claude-multi-agent-workflow
/plugin install api-quality@api-quality-marketplace
```

To work on the plugin instead of installing it, load it straight from a clone:

```
git clone https://github.com/makar111111/claude-multi-agent-workflow
cd claude-multi-agent-workflow
claude --plugin-dir .
```

Use `/reload-plugins` to pick up edits without restarting the session.

## Use it

```
/api-quality:quality-sweep            # sweeps course-api/
/api-quality:quality-sweep path/to/api
```

You get one report: a verdict, the merged findings with `file:line`, the tests
that were added, whether the suite is green, and anything left uncovered.

## What is in the bundle

| Component | Name | What it does |
|---|---|---|
| Command | `/api-quality:quality-sweep` | Orchestrates the whole sweep — two reviews in parallel, then test authoring |
| Subagent | `api-reviewer` | Read-only. Reviews a scope against the project's conventions and reports findings with severity |
| Subagent | `test-author` | Writes tests for the findings, runs the suite, reports what passed and what genuinely broke |
| Skill | `express-api-conventions` | The house rules — error shape, status codes, where validation belongs, how routes talk to the store |
| Hook | `PostToolUse` on `Write`/`Edit` | Lints the file that was just written and hands any problems back into the session |

### The workflow

```
Step 0  read CLAUDE.md + package.json           orientation
           |
Step 1  +--+---------------+                    PARALLEL
        v                  v                    (one message, both at once)
   api-reviewer A     api-reviewer B
   routes/ + server   db/ + docs/ + tests/
        +--------+---------+
                 v
Step 2   merge, dedupe, rank findings           DEPENDENT
                 v
Step 3   test-author writes + runs tests        DEPENDENT
                 v
Step 4   single report to the user
```

The two reviews never read each other's output, so they run at the same time.
Everything after them needs their combined result, so it waits.

## Requirements

- Claude Code 2.x.
- Node.js 18+ and an ESLint install in the project you point it at — the hook
  uses the project's own ESLint and stays silent when there is none.

## Try it on the bundled API

```bash
cd course-api && npm install
```

Then run `/api-quality:quality-sweep` from the repository root.

## Notes

Design decisions — why each subagent got the tools and model it did, and why the
workflow splits the way it does — are written up in [NOTES.md](NOTES.md). The
course brief this plugin was built for is kept in
[docs/PROJECT-BRIEF.md](docs/PROJECT-BRIEF.md).
