# api-quality

A Claude Code plugin that runs a multi-agent quality pass on an Express API: it reviews the routes and scouts test coverage at the same time, then writes the missing tests - and lints every JavaScript file Claude touches along the way.

This repository is both the plugin and the marketplace that offers it. The Express API in `course-api/` is the codebase it is tested against.

## Install

```
/plugin marketplace add Brokkoliii/claude-multi-agent-workflow
/plugin install api-quality@brokkoliii-plugins
```

To try it without installing, clone the repo and run `claude --plugin-dir .` from its root.

## What it adds

| Piece | Name | What it does |
|---|---|---|
| Command | `/api-quality:quality-pass [api folder]` | Runs the whole workflow (default folder: `course-api/`). |
| Subagent | `api-reviewer` (read-only, `sonnet`) | Reviews routes and the store against the API's conventions and reports findings by severity. |
| Subagent | `coverage-scout` (read-only, `haiku`) | Maps which endpoints and error paths have tests and lists the gaps. |
| Subagent | `test-writer` (can write, `sonnet`) | Writes and runs the missing tests; only touches the `tests/` folder. |
| Skill | `api-conventions` | The API's conventions for validation, status codes, error shape and tests; Claude loads it when you add, change or review routes. |
| Hook | `PostToolUse` on `Write\|Edit` | Runs the project's own ESLint on any JavaScript file Claude writes and feeds problems straight back. |

## How the workflow runs

```
quality-pass
 ├─ step 1, in parallel:  api-reviewer  +  coverage-scout
 ├─ step 2, after both:   test-writer   (gets the gaps and the reviewer's behaviour findings)
 └─ step 3:               report + real `npm test` / `npm run lint` results
```

See [NOTES.md](NOTES.md) for why it is split this way.

## Layout

```
.
├── .claude-plugin/
│   ├── plugin.json         # manifest: name, version
│   └── marketplace.json    # catalog that lists this plugin
├── agents/                 # api-reviewer, coverage-scout, test-writer
├── commands/               # quality-pass
├── skills/api-conventions/ # SKILL.md
├── hooks/                  # hooks.json + lint-edited.js
├── course-api/             # the Express API under test
├── README.md
└── NOTES.md
```

Only manifest files live in `.claude-plugin/`; every component folder sits at the repo root.

## Try it on the sample API

```bash
cd course-api && npm install && cd ..
claude --plugin-dir .
```

Then run `/api-quality:quality-pass`. After editing any component, use `/reload-plugins`.

## Validation

The **Validate plugin** workflow runs on every push. Run the same check locally with:

```bash
node .github/scripts/validate-plugin.js
```
