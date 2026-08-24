# api-quality

A Claude Code plugin that runs a **three-agent quality gate over an Express
API**: two read-only agents inspect the code and the docs in parallel, then a
third turns everything they found into regression tests and runs the suite.

You get back a list of defects that are *proven by a failing test*, not a list of
things an LLM thought looked suspicious.

This repo is two things at once: the plugin, and the marketplace that offers it.
`course-api/` is the Express API the plugin is built and tested against.

---

## Install

```
/plugin marketplace add EvheniiChuhai/claude-multi-agent-workflow
/plugin install api-quality@evhenii-tools
```

Or, to run it from a local clone without installing:

```
claude --plugin-dir /path/to/claude-multi-agent-workflow
```

---

## Use it

From a repo containing an Express API:

```
/api-quality:harden course-api/
```

The path is optional — it defaults to `course-api/`.

---

## What's in the box

| Component | Name | What it does |
| --- | --- | --- |
| Command | `/api-quality:harden` | Runs the whole workflow: review + audit in parallel, then tests. |
| Agent | `api-reviewer` | Read-only. Finds validation gaps, wrong status codes, error-shape drift, state leaks. |
| Agent | `contract-auditor` | Read-only. Cross-checks `docs/api.md` and `CLAUDE.md` conventions against the code. |
| Agent | `test-author` | Writes regression tests into the existing suite, runs it, reports real failures. |
| Skill | `express-api-conventions` | The house rules: file layout, status codes, error shape, validation, test style. |
| Hook | `PostToolUse` on `Write`/`Edit` | Lints the edited JS file with the project's own ESLint and feeds errors straight back. |

### How the workflow runs

```
        ┌──────────────────┐
        │  Step 1: survey  │   list routes, store, docs, tests
        └────────┬─────────┘
                 │
      ┌──────────┴──────────┐        parallel — neither
      ▼                     ▼        needs the other's output
┌─────────────┐   ┌────────────────────┐
│ api-reviewer│   │ contract-auditor   │
└──────┬──────┘   └─────────┬──────────┘
       └──────────┬─────────┘
                  ▼                     sequential — its input is the
        ┌────────────────────┐          union of both reports
        │    test-author     │
        └─────────┬──────────┘
                  ▼
          verdict + defect list
```

The two read-only agents answer different questions about the same files, and
neither consumes the other's output — so they run together. `test-author` runs
last because its brief *is* the merged findings from both, which don't exist
until both have returned. The reasoning is written out in [NOTES.md](NOTES.md).

### The agents are scoped, not general

`api-reviewer` and `contract-auditor` carry `tools: Read, Grep, Glob` — they
physically cannot edit the code they are judging. `test-author` is the only one
with `Write`, `Edit`, and `Bash`, and its brief forbids touching anything under
`routes/` or `db/`. Models are matched to the work: `opus` for the reviewer's
judgment calls, `haiku` for the auditor's mechanical cross-referencing, `sonnet`
for writing tests.

---

## Try it against the bundled API

```bash
cd course-api && npm install
cd .. && claude --plugin-dir .
```

Then run `/api-quality:harden course-api/`.

The API has a real defect waiting for it: `POST /users` rejects an empty name
with a `400`, but `PUT /users/:id` happily accepts `{ "name": "" }` and returns
`200` with the name blanked out. `api-reviewer` reports it, `test-author` proves
it with a failing test.

---

## Layout

```
.claude-plugin/
  plugin.json         manifest — name, version
  marketplace.json    the catalog this repo publishes
agents/               three scoped subagents
commands/harden.md    the workflow command
skills/express-api-conventions/SKILL.md
hooks/hooks.json      → scripts/lint-changed.js via ${CLAUDE_PLUGIN_ROOT}
scripts/              bundled hook script
course-api/           the Express API this is tested against
```

Only manifests live in `.claude-plugin/`; every component folder sits at the
repo root.

---

The original course brief for this project is in [PROJECT.md](PROJECT.md).
