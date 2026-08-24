# code-quality-guard

A Claude Code plugin that runs a small multi-agent code-quality workflow against an Express API: it reviews route and data-layer code in parallel, then writes or updates tests to close whatever gaps the review finds.

This repository is both the plugin itself and the marketplace that offers it.

## What's inside

| Component | Path | Purpose |
|---|---|---|
| Subagent | `agents/code-reviewer.md` | Read-only reviewer for routes/store code — flags validation, status-code, and error-shape issues. |
| Subagent | `agents/test-writer.md` | Writes/edits tests under `course-api/tests/` and runs the suite to confirm they pass. |
| Command | `commands/guard.md` | `/guard` — orchestrates both subagents: parallel review, then dependent test authoring. |
| Skill | `skills/api-conventions/SKILL.md` | The project's routing/validation/error/testing conventions, so agents match existing style. |
| Hook | `hooks/hooks.json` | Lints any `.js` file right after it's edited or written, using the project's own ESLint config. |

## Install

In a Claude Code session:

```
/plugin marketplace add Fanca123/claude-multi-agent-workflow
/plugin install code-quality-guard@fanca123-marketplace
```

## Try it locally (from a clean checkout)

```bash
git clone https://github.com/Fanca123/claude-multi-agent-workflow.git
cd claude-multi-agent-workflow/course-api
npm install
cd ..
claude --plugin-dir .
```

Then, inside the session, run:

```
/guard
```

It reviews `course-api/routes/` and `course-api/db/store.js` in parallel, then hands the combined findings to the test-writer subagent, which adds/updates tests in `course-api/tests/` and runs `npm test`. Use `/reload-plugins` after editing any plugin file to pick up the change without restarting the session.

## Why this shape

See [NOTES.md](NOTES.md) for the scoping and orchestration decisions behind the two subagents and the `/guard` command.
