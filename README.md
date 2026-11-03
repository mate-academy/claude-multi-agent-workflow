# code-quality

This is my end-of-course project: a Claude Code plugin that bundles a small
multi-agent workflow for keeping the course API (`course-api/`) clean. The same
repo is both the plugin and the marketplace that offers it.

The idea: review the API's route files against the project's own conventions, then
turn whatever the review finds into regression tests so the same mistake can't come
back quietly.

## What's in it

- **Two subagents** (`agents/`)
  - `api-reviewer` — read-only. Reads a route file and reports how well it follows
    the conventions (400 on bad input, 404 for missing records, the
    `{ "error": "message" }` shape, state only through `db/store.js`). It can't edit
    anything, on purpose.
  - `test-author` — can write and run code. Takes findings and writes/extends tests
    under `course-api/tests/`, then runs `npm test` to confirm they pass.
- **A workflow command** (`commands/quality-check.md`) — `/quality-check` runs the
  reviewers in parallel, then feeds their findings to the test author (a step that
  depends on the reviews finishing first).
- **A skill** (`skills/api-conventions/SKILL.md`) — the API's conventions written
  down in one place, so both the agents and I follow the same rules.
- **A hook** (`hooks/hooks.json`) — after any Write or Edit it runs a small bundled
  script that reminds me to re-run lint and tests. The script is referenced through
  `${CLAUDE_PLUGIN_ROOT}` so it resolves wherever the plugin is installed.

## Layout

```
.claude-plugin/
  plugin.json        # manifest: name + version
  marketplace.json   # marketplace catalog listing this plugin
agents/
  api-reviewer.md
  test-author.md
commands/
  quality-check.md
skills/
  api-conventions/SKILL.md
hooks/
  hooks.json
  scripts/lint-reminder.sh
course-api/          # the Express API to test the plugin against
```

Only `plugin.json` and `marketplace.json` live inside `.claude-plugin/` — every
component folder sits at the repo root.

## Try it locally

From the repo root:

```bash
claude --plugin-dir .
```

Then inside Claude Code:

- Run `/quality-check` to kick off the workflow against `course-api/`.
- `@api-reviewer` and `@test-author` are available as subagents.
- `/reload-plugins` picks up edits while you're iterating.

(First time: `cd course-api && npm install` so the API and its tests can run.)

## Install it as a marketplace

```
/plugin marketplace add <this repo>
/plugin install code-quality@cecilia-plugins
```

More detail — the scoping and orchestration choices I made — is in `NOTES.md`.
