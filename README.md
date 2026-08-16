# Code Quality Kit

A Claude Code plugin for improving code quality in Express projects.

## Components

- `/code-quality-kit:quality-workflow` — runs review and test work as a coordinated workflow.
- `code-reviewer` — read-only review agent for bugs, edge cases, validation, and risky changes.
- `test-writer` — test-focused agent that can inspect and add tests.
- `api-quality` — skill for the project's Express API conventions.
- `hooks/hooks.json` — confirms code changes after Write/Edit operations.

## Local use

From the repository root, load the plugin with:

    claude --plugin-dir .

Then run:

    /code-quality-kit:quality-workflow

The plugin is designed so independent review and test work can happen in parallel before final verification.
