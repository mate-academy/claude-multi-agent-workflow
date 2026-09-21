# Project Notes

## What the plugin does

`quality-kit` is a Claude Code plugin for reviewing code quality, auditing tests, and applying verified fixes.

The `/quality-kit:quality` workflow runs two read-only agents in parallel:

- `code-reviewer` looks for bugs, unclear logic, error-handling problems, and maintainability issues.
- `test-auditor` looks for missing coverage, weak assertions, and untested edge cases.

After both reviews finish, `code-fixer` verifies the findings and applies safe fixes.

## Installation

Run Claude Code with the plugin directory for local testing:

`claude --plugin-dir .`

After publishing the marketplace, install the plugin with:

`/plugin marketplace add <your-repository>`

Then:

`/plugin install quality-kit@quality-kit-marketplace`

## Scoping decision

The plugin is intentionally focused on code quality rather than general code review or feature development. This keeps the agents' responsibilities clear and makes it easier to verify findings before changes are applied.

The `code-reviewer` and `test-auditor` agents are read-only so they can independently analyse the project without modifying the code. The `code-fixer` is the only agent allowed to edit files.

## Why the workflow uses parallel and sequential steps

The code review and test audit are independent analyses, so they run in parallel to reduce waiting time.

The fix step runs after both analyses finish because `code-fixer` needs the combined findings from both agents and must verify those findings against the current code before making changes.
