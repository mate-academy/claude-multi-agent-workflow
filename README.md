# api-quality-kit

A Claude Code plugin for keeping the Express course API in `course-api/` healthy. It reviews the API, finds the behaviours the tests miss, writes tests for them, and checks every JavaScript file Claude edits for syntax errors.

## What it adds

| Component | Name in Claude Code | What it does |
|---|---|---|
| Workflow command | `/api-quality-kit:quality-check` | Runs the review and the test-gap analysis in parallel, then writes tests for the gaps, then reports. |
| Subagent (read-only) | `api-quality-kit:api-reviewer` | Reviews routes, the store and the server for bugs, validation gaps and wrong status codes. Tools: Read, Grep, Glob. |
| Subagent (writes tests) | `api-quality-kit:test-helper` | Lists untested behaviours, or writes tests for them in `course-api/tests/` and runs `npm test`. Tools: Read, Grep, Glob, Edit, Write, Bash. |
| Skill | `api-quality` | The checklist for Express routes: validation, status codes, the `{ "error": "message" }` shape, store access, tests, docs. |
| Hook | PostToolUse on Write and Edit | Runs `node --check` on any edited `.js` file and reports syntax errors back to Claude. |

## Install

    /plugin marketplace add iencivlad-prog/claude-multi-agent-workflow
    /plugin install api-quality-kit@api-quality-marketplace

## Try it locally without installing

From the repository root:

    cd course-api
    npm install
    cd ..
    claude --plugin-dir .

Then run `/api-quality-kit:quality-check`. You can add a focus, for example `/api-quality-kit:quality-check routes/users.js`. After editing any plugin file, run `/reload-plugins`.

## Layout

    .claude-plugin/plugin.json        manifest: name and version
    .claude-plugin/marketplace.json   catalog that lists this plugin
    agents/api-reviewer.md            read-only reviewer
    agents/test-helper.md             test writer
    commands/quality-check.md         the workflow command
    skills/api-quality/SKILL.md       route checklist
    hooks/hooks.json                  syntax-check hook
    scripts/check-syntax.js           script the hook runs
    course-api/                       the Express API the plugin works on
