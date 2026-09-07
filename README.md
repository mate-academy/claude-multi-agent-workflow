# course-quality-guard

A Claude Code plugin that keeps [`course-api`](course-api/) — the small Express app bundled in
this repo — honest about its own conventions: all data access through `db/store.js`, `400`/`404`
validation, a consistent `{ "error": "message" }` error shape, and test coverage per route. See
[`NOTES.md`](NOTES.md) for the design decisions behind it.

## What's inside

| Component | Name | What it does |
|---|---|---|
| Agent (read-only) | `convention-auditor` | Audits `course-api` against `course-api/CLAUDE.md` and reports a structured findings checklist — never edits files. |
| Agent (writes) | `fix-and-cover` | Takes a findings checklist, applies mechanical fixes, writes missing tests, and reruns `npm test`. Leaves judgment calls for a human. |
| Command | `/code-quality-check` | Runs a full sweep: `convention-auditor` + `npm test`/lint in parallel, then `fix-and-cover` once both finish. |
| Skill | `new-endpoint` | Scaffolds a new Express resource (route, store helpers, test) that's convention-compliant from the start. |
| Hooks | `hooks.json` | `PostToolUse` nudge on route edits that bypass `db/store.js`; `PreToolUse` gate that blocks `git commit` if `course-api`'s tests are failing. |

## Install

```
# from a clean checkout, to try it locally:
(cd course-api && npm install)   # install course-api's deps once
claude --plugin-dir .            # run from THIS repo's root — the plugin
                                  # manifest lives here, not in course-api/

# once pushed, from any Claude Code session:
/plugin marketplace add <this-repo-url>
/plugin install course-quality-guard@course-api-marketplace
```

## Try it

Inside a session with the plugin loaded, run `/course-quality-guard:code-quality-check` against
`course-api`, or `/course-quality-guard:new-endpoint` to scaffold a new resource.
