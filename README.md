# api-quality

A Claude Code plugin that runs a **multi-agent quality sweep** over an Express API: two reviewers
read the code in parallel against its own conventions, then a test author backfills exactly the
tests those reviews call for — and a hook lints every JavaScript file as you edit it.

Built against [`course-api/`](course-api/), the small Express API included in this repo.

---

## Install

From a marketplace (this repo is both the plugin and the marketplace):

```
/plugin marketplace add volodymyrlp/claude-multi-agent-workflow
/plugin install api-quality@volodymyr-plugins
```

Or load it straight from a clone, without installing:

```
git clone git@github.com:volodymyrlp/claude-multi-agent-workflow.git
cd claude-multi-agent-workflow
claude --plugin-dir .
```

Then, in the API you want swept:

```
/api-quality:quality-sweep course-api/
```

---

## What's in it

| Piece | Name | What it does |
| --- | --- | --- |
| Command | `/api-quality:quality-sweep [path]` | The whole workflow: parallel review → dependent test backfill → one report. |
| Subagent | `api-reviewer` | Read-only. Reads routes and the store, reports findings and untested behaviour. Never edits. |
| Subagent | `test-author` | Turns the reviewers' untested-behaviour list into real tests and runs the suite. |
| Skill | `express-api-conventions` | The rules both agents judge against: routing, state through the store, 400/404, `{ "error" }`. |
| Hook | `PostToolUse` on `Write`/`Edit` | Runs ESLint on the file just edited and hands the errors straight back to Claude. |

## How the workflow runs

```
        ┌─ api-reviewer  →  server.js + routes/   ─┐
Step 1 ─┤            (in parallel)                 ├─→ Step 2 ─ test-author ─→ Step 3 ─ report
        └─ api-reviewer  →  db/store.js + tests/  ─┘        (waits for both)
```

**Step 1** is parallel because the two scopes are disjoint — neither reviewer needs the other's
output. **Step 2** is sequential because its input is the *merged* findings of both, and only the
reviewer that read `tests/` knows what the suite already covers.

The reasoning behind the tool and model scoping is in [NOTES.md](NOTES.md).

## Requirements

Node 20+ for the linting hook and the API's test suite. `cd course-api && npm install` once, so
`npm test` and the hook's ESLint run have something to work with.

## Layout

```
.claude-plugin/plugin.json         manifest — name + version
.claude-plugin/marketplace.json    catalog — this repo as a marketplace
agents/                            api-reviewer.md, test-author.md
commands/                          quality-sweep.md
skills/express-api-conventions/    SKILL.md
hooks/hooks.json                   PostToolUse → scripts/lint-changed.sh
scripts/lint-changed.sh            resolved via ${CLAUDE_PLUGIN_ROOT}, never a fixed path
course-api/                        the Express API this plugin is built and tested against
```

The course brief this repo answers is in [PROJECT.md](PROJECT.md).
