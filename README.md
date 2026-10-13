# code-quality

A Claude Code plugin that runs a multi-agent code-quality workflow against a project, plus a marketplace entry so it installs by name. The `course-api/` folder is the Express API it is tested against.

## What it adds

| Component | Type | What it does |
|---|---|---|
| `/code-quality:quality-check` | Command | Runs review, lint, and tests in parallel, then has a test writer fill the gaps. |
| `code-reviewer` | Subagent (read-only) | Reviews code for bugs and convention violations; lists test gaps. |
| `test-writer` | Subagent (writes) | Adds tests under `tests/` and runs the suite. |
| `api-conventions` | Skill | The project's route, store, validation, and error-shape conventions. |
| lint hook | Hook | Lints any `.js` file right after Claude writes or edits it. |

## Install

```
/plugin marketplace add Wongytron/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

## Try it locally

```
cd course-api && npm install && cd ..
claude --plugin-dir .
/code-quality:quality-check course-api
```

Use `/reload-plugins` after editing plugin files. See `NOTES.md` for the design decisions.
