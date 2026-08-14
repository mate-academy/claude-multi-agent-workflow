# quality-guard

A Claude Code plugin that packages a small code-quality workflow for Express APIs: a read-only code reviewer, a test-writing agent, and a `/qa` command that runs them together — parallel review, then dependent test generation — plus a lint hook and a test-style skill.

This repository is both the plugin and the marketplace that serves it. `course-api/` is the sample Express API (users CRUD over an in-memory store) used to build and test the plugin against real code.

## What's in the plugin

| Component | Path | Purpose |
|---|---|---|
| Subagent — read-only | `agents/code-reviewer.md` | Reads code, flags bugs/security/convention issues and untested paths. Never edits files. |
| Subagent — write/edit | `agents/test-writer.md` | Writes/updates tests in `tests/` to close gaps, runs `npm test`. |
| Workflow command | `commands/qa.md` | `/quality-guard:qa` — runs both reviewer passes in parallel, then the test writer as a dependent step, then summarizes. |
| Skill | `skills/express-test-patterns/SKILL.md` | Node `node:test` + `supertest` conventions so generated tests match the codebase's style. |
| Hook | `hooks/hooks.json` + `hooks/scripts/lint-check.js` | `PostToolUse` on `Edit`/`Write`: lints the touched file and reports issues back to Claude. |

## Install

From inside a Claude Code session:

```
/plugin marketplace add romanazhniuk/claude-multi-agent-workflow
/plugin install quality-guard@roman-plugins
```

(Or, for local development, clone this repo and run `claude --plugin-dir .` from its root — no marketplace step needed.)

## Try it against the sample API

```
cd course-api && npm install   # once
claude --plugin-dir .          # from the repo root
```

Then, in the session:

```
/quality-guard:qa course-api
```

This dispatches `code-reviewer` twice in parallel (once over `routes/` + `server.js`, once over `db/`), merges their findings, then dispatches `test-writer` to close the gaps in `tests/` and confirm the suite still passes.

You can also invoke either subagent directly ("use the code-reviewer subagent to look at course-api/routes/users.js") or ask Claude to use the `express-test-patterns` skill when writing tests by hand.

## Structure

```
.claude-plugin/
  plugin.json        # manifest: name + version
  marketplace.json    # lists this plugin for /plugin marketplace add
agents/
  code-reviewer.md    # read-only
  test-writer.md       # write/edit
commands/
  qa.md                # the /qa workflow
skills/
  express-test-patterns/SKILL.md
hooks/
  hooks.json
  scripts/lint-check.js
course-api/            # sample Express API used to build/test against
```

See `NOTES.md` for the scoping and orchestration decisions behind this design.
