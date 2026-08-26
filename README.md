# Code Quality Workflow

A Claude Code plugin for reviewing and improving the Express API with scoped subagents.

## Components

- `api-reviewer` — read-only API reviewer that identifies bugs, security issues, validation problems, and unclear code.
- `test-fixer` — editing agent that applies focused fixes and runs relevant tests.
- `/code-quality-workflow` — orchestrates the review and fixing workflow.
- `code-quality` skill — provides reusable guidelines for API quality reviews.
- PostToolUse hook — reminds you to run tests after code changes.

## Installation

Load the plugin from the repository root:

    claude --plugin-dir .

Use `/reload-plugins` after changing plugin files.

## Usage

Run the workflow with:

    /code-quality-workflow

The workflow starts independent API review and test inspection, then passes their results to `test-fixer` for dependent fixes.

## Structure

    .claude-plugin/
    L-- plugin.json

    agents/
    +-- api-reviewer.md
    L-- test-fixer.md

    commands/
    L-- quality-workflow.md

    skills/
    L-- code-quality/
        L-- SKILL.md

    hooks/
    L-- hooks.json
