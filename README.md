# api-quality

A Claude Code plugin that runs a code-quality pass over an Express API: two
read-only reviewers working in parallel, then a test-writing agent that pins down
whatever they found, with the project's route conventions available as a skill and
ESLint wired to every edit.

This repository is both the plugin and the marketplace that offers it. It also
carries a sample Express API in [`course-api/`](course-api/) to run the plugin
against.

## Install

```
/plugin marketplace add MishaLehotskyi/claude-multi-agent-workflow
/plugin install api-quality@misha-plugins
```

To work on the plugin itself, load it straight off disk instead:

```
claude --plugin-dir .
```

Use `/reload-plugins` to pick up edits without restarting the session.

## What it does

```
/api-quality:quality-pass course-api/
│
├─ Step 1  parallel   route-reviewer   ┐  both read-only, launched
│                     contract-auditor ┘  together in one message
│
├─ Step 2  waits      test-writer         tests the merged findings
│
└─ Step 3  waits      summary             verdict, must-fix, tests added
```

One command drives the whole flow. `route-reviewer` and `contract-auditor` read the same code but never each other's
output, so they run at the same time. Their findings are merged into one list, and
only then does `test-writer` start — what it writes is decided by what they found.
The command reports a verdict, the must-fix list, doc mismatches, and the tests that
were added.

A red suite at the end is a success, not a failure: it means a regression test caught
a real bug. `test-writer` is told to leave route code alone, so the fix stays yours.

## What's inside

| Component | Name in a session | What it is for |
| --- | --- | --- |
| Command | `/api-quality:quality-pass` | Runs the whole workflow — parallel review, then tests |
| Agent | `api-quality:route-reviewer` | Correctness review of routes and the data store. Read-only, `opus` |
| Agent | `api-quality:contract-auditor` | Diffs `docs/api.md` against the routes that exist. Read-only, `haiku` |
| Agent | `api-quality:test-writer` | Writes regression tests and runs the suite. Edits tests only, `sonnet` |
| Skill | `api-quality:express-api-conventions` | The house rules — status codes, error shape, where state lives, how tests are written |
| Hook | `PostToolUse` on `Write`/`Edit` | Lints the file just changed and hands ESLint's output back to Claude |

The agents can also be called on their own when you don't need the full pass — ask
for a review of `routes/users.js` and `route-reviewer` picks it up.

### The hook

[`hooks/scripts/lint-changed.js`](hooks/scripts/lint-changed.js) runs after every
`Write` and `Edit`. It finds the nearest `package.json` above the edited file and
runs that project's own ESLint on that one file, exiting `2` with the output so
Claude sees the problems and fixes them in the same turn. It stays silent for
non-JavaScript files, for `node_modules`, and for projects with no ESLint installed,
so it is safe to leave on in a mixed repo. It is referenced through
`${CLAUDE_PLUGIN_ROOT}`, so it resolves wherever the plugin installs.

## Trying it out

```
cd course-api && npm install && cd ..
claude --plugin-dir .
```

Then, in the session:

```
/api-quality:quality-pass course-api/
```

The sample API has real gaps on a clean checkout, so the pass has something to
report. Two that it finds: `GET /users/abc` answers `404 User not found` where a
non-numeric id should be a `400`, and `PUT /users/1` with `{"name": ""}` returns
`200` and stores the empty name, while `POST /users` rejects the same value with a
`400`.

## Layout

```
.claude-plugin/
  plugin.json          manifest — name and version
  marketplace.json     catalog — this repo as a marketplace
agents/                the three subagents
commands/              the workflow command
skills/                express-api-conventions
hooks/                 hooks.json and the bundled lint script
course-api/            sample Express API to run the plugin against
docs/PROJECT.md        the course brief this plugin was built for
NOTES.md               install steps and the design decisions behind it
```

Only `plugin.json` and `marketplace.json` live inside `.claude-plugin/`; every
component folder sits at the repo root.

## Versioning

The version lives in `.claude-plugin/plugin.json`. Bump it when a component's
behaviour changes, and tag the commit so installs can pin to it.
