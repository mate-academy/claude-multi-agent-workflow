# ship-check

A code-quality plugin built and tested against `course-api/`, the small
Express API used throughout the Claude Code course. It bundles a
two-agent review + test-coverage workflow behind one command, plus a
skill and a hook that round it out.

## What it does

- **`code-reviewer`** (subagent, read-only) — reviews a change for bugs,
  missing error handling, unclear naming, and deviations from
  `course-api`'s own conventions. Never edits files.
- **`test-writer`** (subagent, can write/edit and run commands) — writes
  or updates tests in `course-api/tests/` for whatever the review (or you)
  says is missing coverage, then runs the suite to confirm it's green.
- **`/ship-check [path]`** — the workflow command. Runs `code-reviewer`
  and `test-writer`'s coverage check in **parallel** (they don't depend on
  each other), then — **dependent** on that step's results — has
  `test-writer` close any coverage gaps the review surfaced, and reports
  the final `npm test` result.
- **`route-conventions`** skill — fires automatically whenever a route in
  `course-api/routes/*.js` is added, changed, or removed, and reminds
  Claude to update `course-api/db/store.js` and the tests together with
  the route, not just the route itself.
- **A `PostToolUse` hook** — auto-runs `eslint --fix` on any `.js` file
  under `course-api/` that gets written or edited, so formatting stays
  consistent without anyone remembering to run lint by hand. The bundled
  script is referenced via `${CLAUDE_PLUGIN_ROOT}`, so it resolves
  correctly wherever the plugin is installed.

## Install

From a Claude Code session, add this repo as a marketplace and install
the plugin from it:

```
/plugin marketplace add sinkobela/claude-multi-agent-workflow
/plugin install ship-check@ship-check-marketplace
```

Or, to run it locally from a clone without installing anything, from the
repo root:

```
claude --plugin-dir .
```

## Use it

- Run `/ship-check:ship-check` (or just `/ship-check`, depending on how
  it's namespaced in your session) to review your current change and
  close any test gaps it exposes.
- Ask "review my recent changes" and Claude will reach for the
  `code-reviewer` subagent on its own.
- Ask it to add or update a route in `course-api/routes/` and the
  `route-conventions` skill will apply automatically.
- After editing a component, run `/reload-plugins` to pick up the change.

## Structure

```
.
├── .claude-plugin/
│   ├── plugin.json           # name + version (the manifest)
│   └── marketplace.json      # lists this plugin so it can be installed
├── agents/
│   ├── code-reviewer.md
│   └── test-writer.md
├── commands/
│   └── ship-check.md
├── skills/
│   └── route-conventions/SKILL.md
├── hooks/
│   └── hooks.json
├── scripts/
│   └── post-edit-lint.js     # bundled script, referenced via ${CLAUDE_PLUGIN_ROOT}
├── course-api/                # the API this plugin is built and tested against
├── README.md
└── NOTES.md
```
