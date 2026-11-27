# code-quality plugin for Claude Code

A plugin that reviews an Express API, finds untested endpoints, and writes the missing tests.

## Install

/plugin marketplace add bogdanotkovic2-code/claude-multi-agent-workflow
/plugin install code-quality@bohdan-plugins

## What's inside

- agents/code-reviewer.md: read-only code reviewer (sonnet)
- agents/coverage-scout.md: read-only coverage mapper (haiku)
- agents/test-writer.md: writes and runs tests (sonnet)
- commands/quality-check.md: workflow command, run as /code-quality:quality-check course-api
- skills/api-test-conventions: test conventions for course-api
- hooks/hooks.json: after Write/Edit, blocks leftover test.only and debugger

## Local testing

claude --plugin-dir .
