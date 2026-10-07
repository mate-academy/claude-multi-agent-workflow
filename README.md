# api-quality

A Claude Code plugin for reviewing Express endpoints and improving regression tests in the included course-api project.

## Install and use

The plugin lives at the repository root. `.claude-plugin/plugin.json` defines api-quality version 0.1.0; `.claude-plugin/marketplace.json` offers it through walle-api-tools with source `./`.

From a complete checkout, install API dependencies with `npm --prefix course-api install`, then load locally with `claude --plugin-dir .`. Run `/api-quality:check-api main` on a feature branch. Use `/reload-plugins` after edits.

For a published default branch containing the plugin and catalog: `/plugin marketplace add Wall-E1982/claude-multi-agent-workflow`, then `/plugin install api-quality@walle-api-tools`. While the submission is only on codex/quality-workflow, use the complete checkout of that branch and a local marketplace path instead of the default-branch repository shorthand. Do not assume an open upstream PR publishes files to main.

## Bundle

- api-reviewer: read-only Sonnet agent for route defects and final assessment.
- api-test-writer: Sonnet agent that may write/edit tests only, without Bash.
- check-api: frozen-snapshot parallel review/test writing, then full checks and dependent final review.
- api-contract-check: documentation and coverage checklist skill.
- PostToolUse Write/Edit hook: project lint. This runs against the current project path, not a bundled script; future bundled scripts must use `${CLAUDE_PLUGIN_ROOT}`.

The test-writer file scope is an instruction, while its tools technically allow file edits; review the actual diff. The included hook expects this repository layout and npm dependencies. It reports lint failures after edits and cannot undo a completed write.

See NOTES.md for actual validation and the theoretical Claude execution walkthrough.
