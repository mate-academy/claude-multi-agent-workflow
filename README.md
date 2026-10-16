# code-quality-kit

A Claude Code plugin that bundles a review-and-test workflow for the `course-api` Express service: two scoped subagents, a workflow command that runs them in parallel then in sequence, a shared conventions skill, and a lint hook — all installable as one plugin.

This repo is also the marketplace that offers it.

## Install

```
/plugin marketplace add Sameerabusara/claude-multi-agent-workflow
/plugin install code-quality-kit@claude-multi-agent-workflow
```

Or, while developing locally, run `claude --plugin-dir .` from this repo's root.

## What's inside

| Component | Name | Does |
|---|---|---|
| Agent | `code-reviewer` | Read-only review of route/handler changes against this project's conventions. |
| Agent | `test-writer` | Writes/updates Node test files and runs `npm test`. |
| Command | `/code-quality-kit:quality-check` | Runs both agents as a workflow: review + coverage scan in parallel, then test-writing + verification once both finish. |
| Skill | `api-conventions` | Shared checklist (validation, status codes, error shape, data access) both agents check against. |
| Hook | `PostToolUse` on `Write`/`Edit` of `*.js` files | Lints the file that was just written or edited. |

## Try it

```
cd course-api && npm install
cd ..
claude --plugin-dir .
```

Then run `/code-quality-kit:quality-check` and watch it review, scan, write tests, and verify them against `course-api/`.

See `NOTES.md` for the scoping and orchestration decisions behind this design.
