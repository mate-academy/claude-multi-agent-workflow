# qa-kit — a code-quality plugin for Claude Code

`qa-kit` reviews your code with two subagents running in parallel, merges what they find, and has a third step propose concrete fixes. It also lints every JavaScript file Claude edits.

This repo is both the plugin and the marketplace (`qa-tools`) that offers it.

## Install

```
/plugin marketplace add tonboybeng/claude-multi-agent-workflow
/plugin install qa-kit@qa-tools
```

To develop locally instead, run from the repo root:

```
claude --plugin-dir .
```

## What's inside

| Component | Name | What it does |
|---|---|---|
| Command | `/qa-kit:review-and-fix [path]` | Runs the full workflow (below) on a path; defaults to `course-api`. |
| Agent | `code-reviewer` | Read-only (`Read, Grep, Glob`). Reports bugs, missing error handling and unclear names, grouped High / Medium / Low with `file:line`. |
| Agent | `code-fixer` | `Read, Write` only. Confirms each finding and writes diff-style proposals to `REVIEW-FIXES.md`. Never edits source files. |
| Skill | `review-checklist` | Shared severity rubric and Express checklist used by the reviewers. |
| Hook | `PostToolUse` on `Edit\|Write\|MultiEdit` | Runs the project's own ESLint on the edited `.js` file and sends errors back to Claude. Does nothing if the project has no ESLint. |

## The workflow

```
prepare (load rubric, split files)
        │
        ├──► code-reviewer (routes)  ─┐   parallel
        └──► code-reviewer (server/db)┘
                    │
              merge findings              waits for both
                    │
               code-fixer                 waits for merge
                    │
            REVIEW-FIXES.md
```

## Try it on the included API

```
cd course-api && npm install && cd ..
claude --plugin-dir .
> /qa-kit:review-and-fix course-api
```

The proposals land in `course-api/REVIEW-FIXES.md`. No source files are changed.

## Layout

```
.claude-plugin/
  plugin.json          # name + version
  marketplace.json     # the qa-tools marketplace
agents/                # code-reviewer.md, code-fixer.md
commands/              # review-and-fix.md
skills/review-checklist/SKILL.md
hooks/hooks.json       # uses ${CLAUDE_PLUGIN_ROOT}/scripts/lint-on-edit.js
scripts/lint-on-edit.js
course-api/            # sample Express API to test against
NOTES.md               # design decisions
```

See [NOTES.md](NOTES.md) for the scoping and orchestration decisions.
