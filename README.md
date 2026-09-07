# code-quality

A Claude Code plugin that gives an Express-style codebase defense-in-depth quality checks: prevent convention drift when new code is written, catch it instantly on edit, gate it at commit time, and — for a thorough pass — audit and fix it deliberately on demand. Built against and tested with [`course-api`](course-api/), the small Express app bundled in this repo.

## Install

Local, from this repo:

```
claude --plugin-dir ./
/reload-plugins   # after any edit to the plugin
```

As a marketplace, from anywhere:

```
/plugin marketplace add MarynaLearning/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

## What's in it

| Component | Type | Fires | Does |
|---|---|---|---|
| `convention-auditor` | subagent (read-only) | on demand | Audits target files against `course-api/CLAUDE.md`'s conventions (data access only through `db/store.js`, `400`/`404` validation, `{ "error": ... }` shape) and flags routes with no test coverage. Outputs a structured checklist, not prose. |
| `fix-and-cover` | subagent (write/edit) | on demand, usually after the auditor | Applies the mechanical/unambiguous fixes from a checklist and writes missing tests, then verifies with `npm test`. Leaves anything needing a design judgment call for a human, with a stated reason. |
| `/code-quality-check` | command | on demand | Orchestrates both agents: runs `convention-auditor` and `npm test` in parallel, then feeds both results into `fix-and-cover`. |
| `new-endpoint` | skill | on demand | Scaffolds a brand-new Express resource (route, `db/store.js` helpers, tests) that's convention-compliant from the start. Suggests running the auditor afterward. |
| store-bypass check | hook (`PostToolUse`) | automatic, every `Edit`/`Write` to a route file | Fast heuristic check for the #1 convention violation — state held outside `db/store.js` — something a generic linter has no concept of. Non-blocking; a nudge, not a gate. |
| commit test gate | hook (`PreToolUse`) | automatic, every `git commit` attempt | Runs `npm test` and blocks the commit if it's red, so you can't accidentally commit on top of a broken suite. |

See [`NOTES.md`](NOTES.md) for the reasoning behind the subagent scoping and the parallel/sequential orchestration choice.

## Try it

Against `course-api/` (see its own [README](course-api/README.md) and [CLAUDE.md](course-api/CLAUDE.md) for the app itself):

```
cd course-api && npm install
```

Then, from a Claude Code session with this plugin loaded:

```
/code-quality-check
```

Or add a new resource from scratch with the `new-endpoint` skill, then confirm it end to end with `convention-auditor`.

## Development

`.github/scripts/validate-plugin.js` checks the plugin's structure on every push — component folders at the root, agent frontmatter, hook JSON validity, `marketplace.json`, etc. Run it locally before pushing:

```
node .github/scripts/validate-plugin.js
```